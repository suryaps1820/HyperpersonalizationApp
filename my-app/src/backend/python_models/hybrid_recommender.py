import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.linalg import svd

df = pd.read_csv("./synthetic_financial_dataset.csv")
customer_profiles = df.groupby('customer_id').agg({
    'interests': ' '.join,
    'financial_needs': ' '.join,
    'occupation': 'first'
}).reset_index()
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(customer_profiles['interests'] + ' ' + customer_profiles['financial_needs'] + ' ' + customer_profiles['occupation'])
content_similarity = cosine_similarity(tfidf_matrix, tfidf_matrix)
transaction_mapping = {
    'purchase': 5,
    'subscription': 4,
    'browse': 2,
    'return': 1
}
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
    if customer_id in predicted_ratings_df.index:
        collaborative_scores = predicted_ratings_df.loc[customer_id]
        collaborative_ranked = collaborative_scores.sort_values(ascending=False).index.tolist()
    else:
        collaborative_ranked = []
    hybrid_scores = {pid: 0.5 * (collaborative_scores.get(pid, 0)) + 0.5 * (content_scores[i] if i in content_ranked else 0) for i, pid in enumerate(user_item_matrix.columns)}
    final_recommendations = sorted(hybrid_scores, key=hybrid_scores.get, reverse=True)[:top_n]
    return final_recommendations
customer_id = df['customer_id'].sample().values[0]
recommended_services = recommend_services(customer_id)
product_mapping = df.set_index('productid')['category'].to_dict()
decoded_recommendations = [product_mapping.get(pid, pid) for pid in recommended_services]
print(f"Recommended services for customer {customer_id}: {decoded_recommendations}")
service_suggestions = {
    "Travel": "You might benefit from a Travel Credit Card with rewards on flights and hotels.",
    "Healthcare": "Consider a Health Insurance plan or a Medical Credit Card for better coverage.",
    "Electronics": "Check out EMI or Buy Now Pay Later (BNPL) financing options.",
    "Education": "An Education Loan or Student Savings Account might be helpful.",
    "Shopping": "Explore Cashback Credit Cards for online and offline purchases.",
    "Dining": "A Dining Rewards Credit Card can give you discounts at restaurants.",
    "Investment": "Look into Mutual Funds, Fixed Deposits, or Stock Trading accounts."
}
decoded_recommendations = [product_mapping.get(pid, pid) for pid in recommended_services]
recommendations_with_suggestions = [
    f"{rec} - {service_suggestions.get(rec, 'No specific banking suggestion')}"
    for rec in decoded_recommendations
]
print(f"Recommended services for customer {customer_id}:")
for rec in recommendations_with_suggestions:
    print(f"🔹 {rec}")
