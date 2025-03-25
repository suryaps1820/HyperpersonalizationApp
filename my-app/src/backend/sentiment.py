import gradio as gr
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Sample banking services database
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


# Function to analyze sentiment using VADER
def analyze_sentiment(comment):
    analyzer = SentimentIntensityAnalyzer()
    sentiment_scores = analyzer.polarity_scores(comment)

    if sentiment_scores["compound"] >= 0.05:
        return "Positive"
    elif sentiment_scores["compound"] <= -0.05:
        return "Negative"
    else:
        return "Neutral"


# Function to classify intent using keyword matching
def classify_intent(comment):
    keywords = {
        "credit card": ["credit card", "cashback", "rewards", "visa", "mastercard"],
        "loan": ["loan", "personal loan", "interest rate", "borrow", "EMI"],
        "home_loan": ["home", "mortgage"],
        "investment": ["investment", "mutual fund", "stocks", "shares", "returns"],
        "savings": ["savings", "bank account", "deposit", "interest"],
        "shopping": ["shopping", "discount", "deals", "offers"],
        "fashion": ["fashion", "clothing", "apparel", "style"]
    }

    for intent, words in keywords.items():
        if any(word in comment.lower() for word in words):
            return intent.capitalize()

    return "Other"


# Function to recommend a banking service
def recommend_service(comment):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(list(services.values()) + [comment])

    similarity = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
    best_match_index = similarity.argmax()

    return df_services.iloc[best_match_index]["Service"]


# Function to process uploaded file and customer comment
def process_uploaded_file(file, customer_id):
    # Read the customer data from the uploaded file
    customer_data = pd.read_csv(file)

    # Convert the input customer_id to string (to handle type mismatches)
    customer_id = str(customer_id)

    # Get the customer's comment based on the customer_id
    customer_comment = customer_data.loc[customer_data['customer_id'].astype(str) == customer_id, 'content']

    # Check if a comment was found
    if customer_comment.empty:
        return "No comment found for this customer ID", "", ""

    customer_comment = customer_comment.values[0]  # Extract the comment text

    sentiment = analyze_sentiment(customer_comment)
    intent = classify_intent(customer_comment)
    recommendation = recommend_service(customer_comment)

    return sentiment, intent, recommendation


# Gradio UI
def main():
    ui = gr.Interface(
        fn=process_uploaded_file,
        inputs=[
            gr.File(label="Upload Customer Data (Excel)"),
            gr.Textbox(label="Enter Customer ID")
        ],
        outputs=[
            gr.Textbox(label="Sentiment", interactive=True),
            gr.Textbox(label="Intent", interactive=True),
            gr.Textbox(label="Recommended Service", interactive=True)
        ],
        title="Banking Service Recommender ",
        description="Upload an Excel file containing customer feedback and enter a customer ID to receive sentiment analysis, intent classification, and service recommendation.",
        theme="compact"  # Choose a UI theme. You can change it to "huggingface" or "default"
    )
    ui.launch()


main()
