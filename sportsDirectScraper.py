import requests
from bs4 import BeautifulSoup
import time
import psycopg2
import sys


def scrape_sportsdirect_product(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                      "(KHTML, like Gecko) Chrome/118.0.5993.90 Safari/537.36"
    }
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    data = {}

    # Example: product name
    name_tag = soup.select_one("#lblProductName")
    if name_tag:
        raw_name = name_tag.get_text(strip=True)
        cleaned_name = raw_name.replace("'","").replace("-","").strip()
        data["name"] = cleaned_name
        
    company_tag = soup.select_one("#lblProductBrand")
    if company_tag:
        raw_company = company_tag.get_text(strip=True)
        cleaned_company = raw_company.replace("'","").replace("-","").strip()
        data["company"] = cleaned_company

    # Example: price
    price_tag = soup.select_one("#lblSellingPrice")
    if price_tag:
        raw_price = price_tag.get_text(strip=True)
        cleaned_price = raw_price.replace("£", "").replace("Â", "").replace(",","").strip()
        data["price"] = float(cleaned_price)
        
    websiteURL_tag = url
    if websiteURL_tag:
        data["websiteURL"] = websiteURL_tag
            
    img_tags = soup.select("img.product-image, img.img-responsive")
    images = []
    for img in img_tags:
        src = img.get("src") or img.get("data-src")
        if src and src.startswith("http"):
            images.append(src)
    if images:
        data["images"] = images
    
    
    size_tags = soup.select("li.tooltip.sizeButtonli")
    sizes = []

    for tag in size_tags:
        # Skip greyed-out (out-of-stock) sizes
        if "greyOut" in tag.get("class", []):
            continue

        size = tag.get_text(strip=True)
        sizes.append(size)

    if sizes:
        data["sizes"] = sizes

    return data

if __name__ == "__main__":
    # Check if URL argument is provided
    if len(sys.argv) < 2:
        print("Usage: python script.py <URL>")
        print("Example: python script.py https://www.houseoffraser.co.uk/brand/belstaff/...")
        sys.exit(1)
    
    url = sys.argv[1]
    
    try:
        product_data = scrape_sportsdirect_product(url)

        label = product_data.get("name", "")
        company = product_data.get("company", "")
        price = product_data.get("price", 0.0)
        website_url = product_data.get("websiteURL", "")
        image_urls = product_data.get("images", [])
        sizes = product_data.get("sizes", [])
        
        # Convert sizes list to SQL array
        sizes_sql = "{" + ", ".join(f'\'{s}\'' for s in sizes) + "}" if sizes else "{}"
        
        imgs_sql = "{" + ", ".join(f'\'{i}\'' for i in image_urls) + "}" if image_urls else "{}"

        # Build SQL statement
        sql = f"""
        INSERT INTO products (label, company, price, websiteURL, imageURL, sizes)
        VALUES ('{label}', '{company}', {price}, '{website_url}', {imgs_sql}, {sizes_sql});
        """

        print(sql.strip())
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error processing data: {e}")
        sys.exit(1)

    # caution: sleep if doing many requests
    time.sleep(2)