from fastapi import FastAPI, HTTPException
import pandas as pd

app = FastAPI()

csv_file_path = "./customer_recommendations.csv"  # Ensure it's in the current folder

def fetch_recommendations(customer_id: int):
    """ Fetch title and details from the CSV file for a given customer_id. """
    try:
        df = pd.read_csv(csv_file_path)

        # Filter by customer_id
        customer_data = df[df["customer_id"] == customer_id]

        if customer_data.empty:
            return []

        # Convert to list of dicts with only title and details
        recommendations = customer_data[["title", "details"]].to_dict(orient="records")
        return recommendations

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="CSV file not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading CSV: {str(e)}")

@app.get("/fetch_recommendations/{customer_id}")
def get_recommendations(customer_id: int):
    """ API endpoint to fetch recommendations for a customer. """
    recommendations = fetch_recommendations(customer_id)
    
    if not recommendations:
        raise HTTPException(status_code=404, detail="No recommendations found for this customer ID.")

    return recommendations  # Returns JSON array directly

@app.get("/get_transactions/{customer_id}")
async def get_transactions(customer_id: int):

    df = pd.read_csv("./synthetic_transactions.csv")
    customer_data = df[df["customer_id"] == customer_id]

    if df.empty:
        raise HTTPException(status_code=404, detail="CSV file is empty or not found")
    
    filtered_data = customer_data[["payment_mode", "purchase_platform", "amount"]]

    if filtered_data.empty:
            raise HTTPException(status_code=404, detail=f"No transactions found for customer_id {customer_id}")

    return filtered_data.to_dict(orient="records")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8002)
