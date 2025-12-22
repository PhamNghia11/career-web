"""
Script to process GDU Google Reviews from JSON file and display/analyze the data.
This script reads JSON data with nested structure (place metadata + reviews) and 
exports processed data for the frontend API.
"""

import json
import sys
from datetime import datetime
from typing import List, Dict, Any
import os

# Fix Windows console encoding for Vietnamese characters
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')


def load_reviews_json(json_file_path: str) -> Dict[str, Any]:
    """
    Load reviews data from JSON file with nested structure
    
    Expected format:
    {
        "place": {
            "name": "...",
            "total_reviews_on_maps": 146,
            "reviews_crawled": 99
        },
        "reviews": [
            {
                "author": "...",
                "rating": 5.0,
                "raw_rating": "5 sao",
                "content": "...",
                "avatar": "https://..."
            },
            ...
        ]
    }
    """
    try:
        with open(json_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        place = data.get('place', {})
        reviews = data.get('reviews', [])
        
        print(f"✓ Loaded JSON file successfully")
        print(f"  Place: {place.get('name', 'Unknown')}")
        print(f"  Total reviews on Maps: {place.get('total_reviews_on_maps', 0)}")
        print(f"  Reviews in file: {len(reviews)}")
        
        return data
        
    except FileNotFoundError:
        print(f"✗ Error: JSON file not found at {json_file_path}")
        return {'place': {}, 'reviews': []}
    except json.JSONDecodeError as e:
        print(f"✗ Error parsing JSON: {str(e)}")
        return {'place': {}, 'reviews': []}
    except Exception as e:
        print(f"✗ Error reading JSON: {str(e)}")
        return {'place': {}, 'reviews': []}


def process_reviews(reviews_data: List[Dict]) -> List[Dict[str, Any]]:
    """
    Process reviews and map to display format for frontend
    """
    processed_reviews = []
    
    for idx, review in enumerate(reviews_data):
        # Generate avatar initials from author name
        author = review.get('author', 'Anonymous')
        name_parts = author.strip().split(' ')
        if len(name_parts) >= 2:
            avatar_initials = (name_parts[0][0] + name_parts[-1][0]).upper()
        else:
            avatar_initials = author[:2].upper() if len(author) >= 2 else 'AN'
        
        processed_review = {
            'id': idx + 1,
            'name': author,
            'avatar': avatar_initials,
            'avatarUrl': review.get('avatar', ''),
            'rating': review.get('rating', 0),
            'comment': review.get('content', '').strip(),
            'raw_rating': review.get('raw_rating', ''),
            'review_time': review.get('review_time', ''),
            'verified': True,  # All Google reviews are verified
        }
        processed_reviews.append(processed_review)
    
    print(f"✓ Processed {len(processed_reviews)} reviews")
    return processed_reviews


def calculate_statistics(reviews: List[Dict], place_data: Dict) -> Dict[str, Any]:
    """
    Calculate statistics from reviews data and place metadata
    """
    if not reviews:
        return {
            'total_reviews': 0,
            'average_rating': 0,
            'rating_distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    total_reviews = len(reviews)
    total_rating = sum(review.get('rating', 0) for review in reviews)
    average_rating = round(total_rating / total_reviews, 2)
    
    # Rating distribution
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for review in reviews:
        rating = int(review.get('rating', 0))
        if rating in rating_distribution:
            rating_distribution[rating] += 1
    
    stats = {
        'total_reviews': total_reviews,
        'average_rating': average_rating,
        'rating_distribution': rating_distribution,
        'verified_count': total_reviews,  # All Google reviews are verified
        # Include place metadata
        'place_name': place_data.get('name', ''),
        'google_maps_rating': average_rating,
        'total_reviews_on_maps': place_data.get('total_reviews_on_maps', 0),
        'reviews_crawled': place_data.get('reviews_crawled', total_reviews),
        'crawl_date': datetime.now().strftime('%Y-%m-%d')
    }
    
    return stats


def export_to_json(data: Any, output_path: str):
    """Export data to JSON file"""
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=2)
        print(f"✓ Exported to {output_path}")
    except Exception as e:
        print(f"✗ Error exporting to JSON: {str(e)}")


def main():
    # Set the path to your JSON file
    json_file_path = 'data/map_reviews_full.json'
    
    print("\n" + "=" * 50)
    print(" Processing Reviews from JSON")
    print("=" * 50 + "\n")
    
    # Load JSON data
    json_data = load_reviews_json(json_file_path)
    
    place_data = json_data.get('place', {})
    reviews_raw = json_data.get('reviews', [])
    
    if not reviews_raw:
        print("\n✗ No reviews found. Please check your JSON file.")
        print(f"  Expected JSON path: {json_file_path}")
        return
    
    # Process reviews
    reviews = process_reviews(reviews_raw)
    
    # Calculate statistics
    stats = calculate_statistics(reviews_raw, place_data)
    
    # Display statistics
    print("\n" + "-" * 40)
    print(" Statistics")
    print("-" * 40)
    print(f"  Total Reviews: {stats['total_reviews']}")
    print(f"  Average Rating: {stats['average_rating']}/5.0")
    print(f"  Total on Google Maps: {stats['total_reviews_on_maps']}")
    
    print("\n  Rating Distribution:")
    for rating in range(5, 0, -1):
        count = stats['rating_distribution'][rating]
        percentage = (count / stats['total_reviews'] * 100) if stats['total_reviews'] > 0 else 0
        bar = '█' * int(percentage / 5)
        print(f"    {rating}★ : {bar} {count} ({percentage:.1f}%)")
    
    # Export processed data for frontend
    print("\n" + "-" * 40)
    print(" Exporting Data")
    print("-" * 40)
    
    # Export reviews
    export_to_json(reviews, 'public/data/reviews.json')
    
    # Export statistics
    export_to_json(stats, 'public/data/reviews-stats.json')
    
    # Export place summary
    place_summary = {
        'place': place_data.get('name', ''),
        'google_maps_rating': stats['average_rating'],
        'total_reviews_on_maps': stats['total_reviews_on_maps'],
        'reviews_crawled': stats['reviews_crawled'],
        'crawl_date': stats['crawl_date']
    }
    export_to_json(place_summary, 'public/data/place-summary.json')
    
    print("\n" + "=" * 50)
    print(" ✓ Data processing complete!")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    main()
