import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Pressable, Image, ActivityIndicator, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';

const { height, width } = Dimensions.get('window');

type Product = {
  id: number;
  label: string;
  company: string;
  price: number;
  websiteurl: string;
  imageurls: string[];
  sizes: string[];
  tags: string[];
};

const ImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle if images is not an array or is null/undefined
  const imageArray = Array.isArray(images) ? images : [];
  const validImages = imageArray.filter(img => {
    if (!img) return false;
    const trimmed = img.trim();
    return trimmed !== '' && trimmed !== 'NA';
  });
  
  console.log('Valid images count:', validImages.length);
  
  if (validImages.length === 0) {
    return (
      <View style={styles.imageContainer}>
        <ThemedText type="title">No Image Available</ThemedText>
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {validImages.map((imageUrl, index) => {
          console.log(`Rendering image ${index}:`, imageUrl);
          return (
            <View key={index} style={styles.imageWrapper}>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.productImage}
                resizeMode="contain"
                onLoad={() => console.log(`Image ${index} loaded successfully`)}
                onError={(e) => console.log(`Image ${index} failed to load:`, e.nativeEvent.error)}
              />
            </View>
          );
        })}
      </ScrollView>
      
      {validImages.length > 1 && (
        <View style={styles.imageCounter}>
          <ThemedText style={styles.counterText}>
            {currentIndex + 1}/{validImages.length}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const Page = ({ product }: { product: Product }) => {
  const [liked, setLiked] = useState(false);
  const { user } = useAuth();
  const toggleHeart = () => setLiked(!liked);

  // Safely convert price to number and format it
  const priceValue = typeof product.price === 'number' 
    ? product.price 
    : parseFloat(product.price) || 0;

  return (
    <View style={styles.page}>
      <ImageCarousel images={product.imageurls || []} />

      <Pressable style={styles.heartContainer} onPress={toggleHeart}>
        <FontAwesomeIcon
          icon={liked ? faHeartSolid : faHeartRegular}
          size={30}
          color={liked ? 'red' : 'white'}
        />
      </Pressable>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{product.label}</ThemedText>
        <ThemedText type="default">Company: {product.company}</ThemedText>
        <ThemedText type="default">Price: £{priceValue.toFixed(2)}</ThemedText>
        {product.sizes && product.sizes.length > 0 && (
          <ThemedText type="default">Sizes: {product.sizes.join(', ')}</ThemedText>
        )}
        {product.tags && product.tags.length > 0 && (
          <ThemedText type="default">Tags: {product.tags.join(', ')}</ThemedText>
        )}
      </ThemedView>
    </View>
  );
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/feed', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('Fetched products:', data);
      
      if (data.success && data.items) {
        setProducts(data.items);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.page, styles.centerContent]}>
        <ActivityIndicator size="large" color="#fff" />
        <ThemedText style={{ marginTop: 16 }}>Loading products...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.page, styles.centerContent]}>
        <ThemedText type="subtitle">Error loading products</ThemedText>
        <ThemedText>{error}</ThemedText>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={[styles.page, styles.centerContent]}>
        <ThemedText type="subtitle">No products available</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <Page product={item} />}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={height}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  page: {
    height: height,
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    width: '100%',
    height: '60%',
    position: 'relative',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  imageWrapper: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: width * 0.9,
    height: '80%',
  },
  imageCounter: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    opacity: 0.9,
  },
  heartContainer: { 
    position: 'absolute',
    right: 20,
    top: '45%',
    borderColor: 'white', 
    borderWidth: 2, 
    borderRadius: 50, 
    padding: 10, 
    paddingLeft: 15,
  },
});