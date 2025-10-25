/* 
    id SERIAL PRIMARY KEY,
    label TEXT,
    company TEXT,
    price NUMERIC,
    websiteURL TEXT,
    imageURL TEXT,
    sizes TEXT[],
    tags TEXT[]
*/

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Blur Phoneix Graphic T-Shirt', 
    'House of Frasers', 
    42.00, 
    'https://www.houseoffraser.co.uk/brand/belstaff/blur-phoenix-graphic-t-shirt-584097#colcode=58409703', 
    ARRAY['NA'], 
    ARRAY['M', 'L'],
    ARRAY['Graphic']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Mens Nowhere Oversized T-Shirt',
    'Boss',
    40.00,
    'https://www.houseoffraser.co.uk/brand/boss/boss-mens-nowhere-oversized-t-shirt-585856#colcode=58585604',
    ARRAY['NA'],,
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Branded']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Mens Thinking 1 T-Shirt, Signature Logo',
    'Boss',
    23.00,
    'https://www.houseoffraser.co.uk/brand/boss/boss-mens-thinking-1-t-shirt--signature-logo-322818#colcode=32281804',
    ARRAY['NA'],,
    ARRAY['XS', 'S', 'M'],
    ARRAY['Branded']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Logo T Shirt',
    'Fred Parry',
    26.00,
    'https://www.houseoffraser.co.uk/brand/fred-perry/logo-t-shirt-599220#colcode=59922041',
    ARRAY['NA'],,
    ARRAY['S', 'XL'],
    ARRAY['Branded', 'Epic']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Mens HBO Jellyfish Oversized T-Shirt',
    'Boss',
    35.00,
    'https://www.houseoffraser.co.uk/brand/boss/boss-mens-hbo-jellyfish-oversized-t-shirt-585857#colcode=58585703',
    ARRAY['NA'],,
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Branded', 'Epic']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Leisure Hoodies Womens',
    'Slazenger',
    7.00,
    'https://www.sportsdirect.com/slazenger-leisure-hoodies-womens-664058#colcode=66405803',
    ARRAY['NA'],,
    ARRAY['8', '10', '12', '14'],
    ARRAY['Branded', 'Epic']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Sportswear Phoenix Fleece Womens Oversized Pullover Hoodie',
    'Nike',
    46.99,
    'https://www.sportsdirect.com/nike-sportswear-phoenix-fleece-womens-over-oversized-pullover-hoodie-669090#colcode=66909008',
    ARRAY['NA'],,
    ARRAY['8', '10', '12', '14'],
    ARRAY['Branded', 'Epic']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Fleece Hoodie Womens',
    'Nike',
    16.00,
    'https://www.sportsdirect.com/slazenger-fleece-hoodie-womens-665654#colcode=66565406',
    ARRAY['NA'],,
    ARRAY['8', '10', '12', '14', '16'],
    ARRAY['Branded', 'Epic']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Kendal Cargo Trousers',
    'JJXX',
    11.00,
    'https://www.sportsdirect.com/jjxx-kendal-cargo-trousers-670146#colcode=67014603',
    ARRAY['NA'],,
    ARRAY['8', '10', '12', '14', '16'],
    ARRAY['Branded', 'Epic']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Straight Side Stripe Trousers',
    'I Saw It First',
    10.00,
    'https://www.sportsdirect.com/i-saw-it-first-straight-side-stripe-trousers-327242#colcode=32724203',
    ARRAY['NA'],,
    ARRAY['8', '10', '12'],
    ARRAY['Branded', 'Epic']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Regular Jeans',
    'Lee Cooper',
    19.99,
    'https://www.sportsdirect.com/lee-cooper-regular-jeans-643032#colcode=64303219',
    ARRAY['NA'],,
    ARRAY['32W R'],
    ARRAY['Branded', 'Epic']
);

INSERT INTO products (
    label,
    company,
    price,
    websiteURL,
    imageURL,
    sizes,
    tags
) VALUES (
    'Phoenix fleece Womens Oversizes Pulloover Hoodie',
    'Nike',
    9.99,
    'https://www.sportsdirect.com/nike-sportswear-phoenix-fleece-womens-over-oversized-pullover-hoodie-669090#colcode=66909008',
    ARRAY['NA'],,
    ARRAY['XS', 'S', 'M', L],
    ARRAY['Branded', 'Epic']
);