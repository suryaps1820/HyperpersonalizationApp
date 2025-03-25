import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.linalg import svd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
# import gradio as gr
import requests
import re
import json
# Load dataset
df = pd.read_csv("./synthetic_financial_dataset.csv")

# Financial Recommendation
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

customer_id = df['customer_id'].sample().values[0]
recommended_services = recommend_services(customer_id)
product_mapping = df.set_index('productid')['category'].to_dict()
financial_recommendations = [product_mapping.get(pid, pid) for pid in recommended_services]

# Social Media Sentiment and Recommendation
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
def analyze_sentiment(comment):
    return "Positive" if analyzer.polarity_scores(comment)["compound"] >= 0.05 else "Negative" if analyzer.polarity_scores(comment)["compound"] <= -0.05 else "Neutral"

def classify_intent(comment):
    keywords = {"credit card": ["credit card", "cashback"], "loan": ["loan", "interest rate"], "investment": ["investment", "stocks"], "savings": ["savings", "deposit"], "shopping": ["shopping", "discount"], "fashion": ["fashion", "clothing"], "home_loan": ["home", "mortgage"]}
    for intent, words in keywords.items():
        if any(word in comment.lower() for word in words):
            return intent.capitalize()
    return "Other"

def recommend_service(comment):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(list(services.values()) + [comment])
    best_match_index = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1]).argmax()
    return df_services.iloc[best_match_index]["Service"]

# Combine Recommendations
social_recommendations = [recommend_service(comment) for comment in df['content'].dropna().sample(5)]

print(f"Generate a title and offer which can based on these recommendations: {financial_recommendations + social_recommendations}")

import requests
import json
import re

mistral_url = "http://localhost:11434/api/generate"

# Example prompt
prompt = f"Generate few titles and offers which can be given from bank side based on these particulars user analysis interest: {financial_recommendations + social_recommendations} in a JSON format: {{title: ..., offer: ...}}"

# Make the request with streaming enabled
response = requests.post(
    mistral_url,
    headers={"Content-Type": "application/json"},
    json={"model": "mistral", "prompt": prompt, "stream": True},
    stream=True
)

print("Streaming Response from Mistral AI:\n")

full_response = ""

# Stream and print response in real-time
for line in response.iter_lines():
    if line:
        try:
            json_data = json.loads(line.decode("utf-8"))
            chunk = json_data.get("response", "")
            full_response += chunk
            print(chunk, end="", flush=True)  # Print as it arrives
        except json.JSONDecodeError as e:
            print(f"\nJSON Decode Error: {e}")

print("\n\nFinal Response from Mistral AI:", full_response)


