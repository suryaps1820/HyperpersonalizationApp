import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.linalg import svd

# Load Dataset
df = pd.read_csv("./synthetic_financial_dataset.csv")

# ------------------- ⿡ Content-Based Filtering ------------------- #
customer_profiles = df.groupby('customer_id').agg({
    'interests': ' '.join,
    'financial_needs': ' '.join,
    'occupation': 'first'
}).reset_index()

tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(customer_profiles['interests'] + ' ' + customer_profiles['financial_needs'] + ' ' + customer_profiles['occupation'])

content_similarity = cosine_similarity(tfidf_matrix, tfidf_matrix)

# ------------------- ⿢ Collaborative Filtering Using SVD ------------------- #
transaction_mapping = {
    'purchase': 5,
    'subscription': 4,
    'browse': 2,
    'return': 1
}
df['rating'] = df['transaction_type'].map(transaction_mapping).fillna(0)

user_item_matrix = df.pivot(index='customer_id', columns='productid', values='rating').fillna(0)

# Perform SVD
U, sigma, Vt = svd(user_item_matrix.values, full_matrices=False)
sigma = np.diag(sigma)
predicted_ratings = np.dot(np.dot(U, sigma), Vt)
predicted_ratings_df = pd.DataFrame(predicted_ratings, index=user_item_matrix.index, columns=user_item_matrix.columns)

# ------------------- ⿣ FAISS-Based Similarity Search ------------------- #
# Load Sentence Transformer Model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Encode banking services
service_texts = df[['productid', 'category']].drop_duplicates().astype(str)
service_descriptions = service_texts['category'].tolist()
service_embeddings = model.encode(service_descriptions)

# Build FAISS Index
index = faiss.IndexFlatL2(service_embeddings.shape[1])
index.add(np.array(service_embeddings))

# ------------------- ⿤ Hybrid Recommendation Function ------------------- #
def recommend_services_faiss(customer_id, top_n=5):
    # Content-Based Scores
    customer_idx = customer_profiles[customer_profiles['customer_id'] == customer_id].index[0]
    content_scores = content_similarity[customer_idx]
    content_ranked = np.argsort(content_scores)[::-1]

    # Collaborative Filtering Scores
    if customer_id in predicted_ratings_df.index:
        collaborative_scores = predicted_ratings_df.loc[customer_id]
        collaborative_ranked = collaborative_scores.sort_values(ascending=False).index.tolist()
    else:
        collaborative_ranked = []

    # Merge Scores
    hybrid_scores = {pid: 0.5 * (collaborative_scores.get(pid, 0)) + 0.5 * (content_scores[i] if i in content_ranked else 0) for i, pid in enumerate(user_item_matrix.columns)}
    
    final_recommendations = sorted(hybrid_scores, key=hybrid_scores.get, reverse=True)[:top_n]

    # FAISS-Based Enhancement
    query = " ".join(customer_profiles.iloc[customer_idx, 1:])  # Customer interests, financial needs, occupation
    query_embedding = model.encode([query])
    D, I = index.search(np.array(query_embedding), k=top_n)

    faiss_recommendations = [service_texts.iloc[i]['productid'] for i in I[0]]
    
    # Merge FAISS with hybrid recommendations
    final_recommendations.extend(faiss_recommendations)
    final_recommendations = list(set(final_recommendations))[:top_n]

    return final_recommendations

# ------------------- ⿥ Test the Model ------------------- #
customer_id = df['customer_id'].sample().values[0]
recommended_services = recommend_services_faiss(customer_id)

# Mapping product IDs to names
product_mapping = df.set_index('productid')['category'].to_dict()
decoded_recommendations = [product_mapping.get(pid, pid) for pid in recommended_services]

print(f"Recommended services for customer {customer_id}: {decoded_recommendations}")