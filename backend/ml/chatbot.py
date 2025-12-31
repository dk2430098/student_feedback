import sys
import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def load_knowledge_base():
    # Construct absolute path to the JSON file
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, 'data', 'knowledgeBase.json')
    
    with open(file_path, 'r') as f:
        return json.load(f)

def find_best_match(user_query, knowledge_base):
    # Prepare corpus: Join all examples for each entry into a single string
    # This creates a "document" for each intent
    corpus = [" ".join(entry['examples']) for entry in knowledge_base]
    
    # Add user query to corpus for vectorization
    corpus.append(user_query)
    
    # Vectorize with n-grams (1,2) to catch phrases like "how to" or "bad food"
    # min_df=1 ensures terms appearing once are kept
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
    except ValueError:
        # Handle empty vocabulary
        return None

    # Calculate Cosine Similarity between user query (last vector) and all others
    user_vector = tfidf_matrix[-1]
    doc_vectors = tfidf_matrix[:-1]
    
    cosine_similarities = cosine_similarity(user_vector, doc_vectors).flatten()
    
    # Find index of best match
    best_match_index = cosine_similarities.argmax()
    best_score = cosine_similarities[best_match_index]
    
    # Threshold for relevance (slightly lowered for n-gram robustness)
    if best_score > 0.05:
        return knowledge_base[best_match_index]['answer']
    else:
        return None

if __name__ == "__main__":
    # Suppress warnings to ensure clean JSON output
    import warnings
    warnings.filterwarnings("ignore")

    # Get user message from command line arguments
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No message provided"}))
        sys.exit(1)
        
    user_message = sys.argv[1]
    kb = load_knowledge_base()
    
    answer = find_best_match(user_message, kb)
    
    if answer:
        print(json.dumps({"reply": answer}))
    else:
        # Fallback response
        fallback = "I'm analyzing your request... 🧐\nI couldn't find a precise match. Could you rephrase?\n\nTry keywords like **'Hostel Food'**, **'Warden'**, or **'Complaint Process'**."
        print(json.dumps({"reply": fallback}))
