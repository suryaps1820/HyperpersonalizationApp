from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Load embeddings model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Example banking services
services = ["Credit Card for Shopping", "High-Interest Savings Account", "Investment Planning", "Personal Loan"]

# Encode services
service_embeddings = model.encode(services)

# Build FAISS index
index = faiss.IndexFlatL2(service_embeddings.shape[1])
index.add(np.array(service_embeddings))

# Recommend based on a query
query = "I want a card with good cashback and low annual fees"
query_embedding = model.encode([query])

D, I = index.search(np.array(query_embedding), k=2)
print("Recommended Services:", [services[i] for i in I[0]])