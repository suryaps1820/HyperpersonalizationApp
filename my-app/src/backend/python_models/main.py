from fastapi import FastAPI
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.linalg import svd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import requests
import json
import re
import os

app = FastAPI()

# Load dataset
df = pd.read_csv("./synthetic_financial_dataset.csv")

# Financial Recommendation Logic
customer_profiles = df.groupby('customer_id').agg({
    'interests': ' '.join,
    'financial_needs': ' '.join,
    'occupation': 'first'
}).reset_index()

tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(customer_profiles['interests'] + ' ' + customer_profiles['financial_needs'] + ' ' + customer_profiles['occupation'])

content_similarity = cosine_similarity(tfidf_matrix, tfidf_matrix)
transaction_mapping = {'purchase': 5, 'subscription': 4, 'browse': 2, 'return': 1}
df['rating'] = df['transaction_type'].map(transaction_mapping).fillna(0)
user_item_matrix = df.pivot(index='customer_id', columns='productid', values='rating').fillna(0)

U, sigma, Vt = svd(user_item_matrix.values, full_matrices=False)
sigma = np.diag(sigma)
predicted_ratings = np.dot(np.dot(U, sigma), Vt)
predicted_ratings_df = pd.DataFrame(predicted_ratings, index=user_item_matrix.index, columns=user_item_matrix.columns)

def recommend_services(customer_id, top_n=5):
    customer_idx = customer_profiles[customer_profiles['customer_id'] == customer_id].index[0]
    content_scores = content_similarity[customer_idx]
    content_ranked = np.argsort(content_scores)[::-1]
    collaborative_scores = predicted_ratings_df.loc[customer_id] if customer_id in predicted_ratings_df.index else []
    hybrid_scores = {pid: 0.5 * (collaborative_scores.get(pid, 0)) + 0.5 * (content_scores[i] if i in content_ranked else 0) for i, pid in enumerate(user_item_matrix.columns)}
    return sorted(hybrid_scores, key=hybrid_scores.get, reverse=True)[:top_n]

# Social Media Sentiment Analysis & Recommendations
services = {
    "Credit Card": "Credit card with cashback and reward points",
    "Loan": "Personal loan with low interest rates and flexible EMI options",
    "Investment": "Investment plans with high returns and tax benefits",
    "Savings": "Savings account with high interest rates and no minimum balance",
    "Shopping": "Shopping discounts on partner brands and exclusive deals",
    "Fashion": "Exclusive offers on fashion brands and seasonal discounts",
    "Home_Loan": "Home loan with low interest rates"
}

df_services = pd.DataFrame(services.items(), columns=["Intent", "Service"])

analyzer = SentimentIntensityAnalyzer()

def recommend_service(comment):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(list(services.values()) + [comment])
    best_match_index = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1]).argmax()
    return df_services.iloc[best_match_index]["Service"]

# 

def get_recommendations(customer_id: int):
    try:
        print(customer_id)
        recommended_services = recommend_services(customer_id)
        product_mapping = df.set_index('productid')['category'].to_dict()
        financial_recommendations = [product_mapping.get(pid, pid) for pid in recommended_services]

        social_recommendations = [recommend_service(comment) for comment in df['content'].dropna().sample(5)]

        mistral_url = "http://localhost:11434/api/generate"

        prompt = f"""
            Generate exactly 3 best titles and offers based on this user's interests from the bank side: {financial_recommendations + social_recommendations}. 

            Return the response **only as a valid JSON array** with this structure:

            [
                {{ "title": "...", "details": "..." }},
                {{ "title": "...", "details": "..." }},
                {{ "title": "...", "details": "..." }}
            ]

            Ensure there is **no additional text, numbers, or explanations** in your response. The output must be directly parsable as a JSON object.
        """

        response = requests.post(
            mistral_url,
            headers={"Content-Type": "application/json"},
            json={"model": "mistral", "prompt": prompt, "stream": True}
        )

        full_response = ""
        try:
            for line in response.iter_lines():
                if line:
                    json_data = json.loads(line.decode("utf-8"))
                    chunk = json_data.get("response", "")
                    full_response += chunk
        except json.JSONDecodeError as e:
            print("\nJSON Decode Error:", e)

        final_json_str = "".join(full_response).strip()

        try:
            recommendations = json.loads(final_json_str)
        except json.JSONDecodeError as e:
            print("Final JSON parsing error:", e)
            recommendations = []

        # Store the recommendations in CSV
        print(recommendations)
        print("")
        if recommendations:
            save_recommendations_to_csv(customer_id, recommendations,df["transaction_type"],df["payment_mode"])

        return {
            "customer_id": customer_id,
            "generated_offers": recommendations
        }

    except Exception as e:
        return {"error": str(e)}

def save_recommendations_to_csv(customer_id, recommendations,transTyp,payMode):
    """ Save the customer recommendations to a CSV file. """
    
    # Convert recommendations to a list of dictionaries
    data = [{"customer_id": customer_id, "title": rec["title"], "details": rec["details"],"transaction_type":transTyp,"payment_mode": payMode} for rec in recommendations]

    # Convert list to DataFrame
    df_recommendations = pd.DataFrame(data)
    csv_file_path = "./customer_recommendations.csv"
    # Check if CSV file exists
    if not os.path.exists(csv_file_path):
        df_recommendations.to_csv(csv_file_path, index=False)
    else:
        df_recommendations.to_csv(csv_file_path, mode='a', header=False, index=False)  # Append without writing headers again


def get_first_100_customer_ids():
    """ Fetch the first 100 customer IDs from the CSV file. """
    try:
        df = pd.read_csv("./synthetic_financial_dataset.csv")
        customer_ids = df["customer_id"].drop_duplicates().head(100).tolist()  # Get first 100 unique IDs
        return customer_ids
    except FileNotFoundError:
        print("CSV file not found.")
        return []
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return []


if __name__ == "__main__":
    # import uvicorn
    # uvicorn.run(app, host="localhost", port=8001)
    customer_ids = get_first_100_customer_ids()
    for customer_id in customer_ids:
        get_recommendations(customer_id)
