import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Pressable, Image, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';

const { height } = Dimensions.get('window');

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

const Page = ({ product }: { product: Product }) => {
  const [liked, setLiked] = useState(false);
  const { user } = useAuth();
  const toggleHeart = () => setLiked(!liked);

  // Get the first image URL, or use a placeholder
  const imageUrl = product.imageurls && product.imageurls.length > 0 
    ? product.imageurls[0] 
    : null;

  // Safely convert price to number and format it
  const priceValue = typeof product.price === 'number' 
    ? product.price 
    : parseFloat(product.price) || 0;

  return (
    <View style={styles.page}>
      <Pressable style={styles.imageContainer} onPress={toggleHeart}>
        {imageUrl && imageUrl !== 'NA' ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : (
          <ThemedText type="title">No Image Available</ThemedText>
        )}
      </Pressable>

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
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: '50%',
    justifyContent: 'center',
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: '100%',
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