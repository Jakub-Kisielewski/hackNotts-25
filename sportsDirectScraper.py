import requests
from bs4 import BeautifulSoup
import time
import psycopg2


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

    # for tag in size_tags:
        
    #     size = tag.get("data-size") or tag.get_text(strip=True)
    #     stock = tag.get("data-stock-qty")
    #     out_of_stock = "outOfStock" in tag.get("class", [])

    # if stock and stock.isdigit() and int(stock) > 0 and not out_of_stock:
    #     sizes.append(size)

    # if sizes:
    #     data["sizes"] = sizes

    return data

if __name__ == "__main__":
    url = "https://www.sportsdirect.com/trespass-claremont-gilet-mens-442704#colcode=44270415"
    product_data = scrape_sportsdirect_product(url)
    print(product_data)

    label = product_data["name"]
    company = product_data["company"]
    price = product_data["price"]
    website_url = product_data["websiteURL"]
    image_urls = product_data["images"]
    sizes = product_data["sizes"]
    
    # Convert sizes list SQL array
    sizes_sql = "{" + ", ".join(f'\'{s}\'' for s in sizes) + "}" if sizes else "{}"
    
    imgs_sql = "{" + ", ".join(f'\'{i}\'' for i in image_urls) + "}" if image_urls else "{}"

    # Build SQL statement
    sql = f"""
    INSERT INTO products (label, company, price, websiteURL, imageURL, sizes)
    VALUES ('{label}', '{company}', {price}, '{website_url}', '{imgs_sql}', '{sizes_sql}');
    """

    print(sql.strip())
    

    # caution: sleep if doing many requests
    time.sleep(2)
