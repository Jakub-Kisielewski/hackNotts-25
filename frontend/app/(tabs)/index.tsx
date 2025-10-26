import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Pressable, Image, ActivityIndicator, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid, faShare as faShareNodes } from '@fortawesome/free-solid-svg-icons';
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

  const imageArray = Array.isArray(images) ? images : [];
  const validImages = imageArray.filter(img => {
    if (!img) return false;
    const trimmed = img.trim();
    return trimmed !== '' && trimmed !== 'NA';
  });
  
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
        {validImages.map((imageUrl, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>
        ))}
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { user } = useAuth();

  const toggleHeart = () => setLiked(!liked);

  const openShareModal = async () => {
    setShowShareModal(true);
    setLoading(true);
    
    try {
      const usersRes = await fetch('http://localhost:3001/users', {
        credentials: 'include',
      });
      
      if (!usersRes.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const usersData = await usersRes.json();
      
      if (usersData.success) {
        setUsers(usersData.users);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (err: any) {
      console.error('Error loading share data:', err);
      Alert.alert('Error', err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const shareProduct = async (userId: number, userName: string) => {
    setSharing(true);
    try {
      console.log('Starting share process...');
      console.log('User ID:', userId);
      console.log('Product ID:', product.id);
      
      // Step 1: Get or create conversation
      const convRes = await fetch('http://localhost:3001/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ other_user_id: userId }),
      });
      
      if (!convRes.ok) {
        const errorData = await convRes.json();
        throw new Error(errorData.error || 'Failed to create conversation');
      }
      
      const convData = await convRes.json();
      console.log('Conversation response:', convData);
      
      if (!convData.success) {
        throw new Error('Failed to create conversation');
      }
      
      // Step 2: Share product
      console.log('Sharing product to conversation:', convData.conversation.id);
      const shareRes = await fetch('http://localhost:3001/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversation_id: convData.conversation.id,
          product_id: product.id,
        }),
      });
      
      if (!shareRes.ok) {
        const errorData = await shareRes.json();
        throw new Error(errorData.error || 'Failed to share product');
      }
      
      const shareData = await shareRes.json();
      console.log('Share response:', shareData);
      
      if (shareData.success) {
        Alert.alert('Success', `Product shared with ${userName}!`);
        setShowShareModal(false);
      } else {
        throw new Error('Share operation failed');
      }
    } catch (err: any) {
      console.error('Error sharing product:', err);
      Alert.alert('Error', err.message || 'Failed to share product');
    } finally {
      setSharing(false);
    }
  };

  const priceValue = typeof product.price === 'number' 
    ? product.price 
    : parseFloat(product.price) || 0;

  return (
    <View style={styles.page}>
      <ImageCarousel images={product.imageurls || []} />

      <View style={styles.actionButtons}>
        <Pressable style={styles.actionButton} onPress={toggleHeart}>
          <FontAwesomeIcon
            icon={liked ? faHeartSolid : faHeartRegular}
            size={30}
            color={liked ? 'red' : 'white'}
          />
        </Pressable>

        <Pressable style={styles.actionButton} onPress={openShareModal}>
          <FontAwesomeIcon icon={faShareNodes} size={30} color="white" />
        </Pressable>
      </View>

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

      <Modal
        visible={showShareModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Share with...
            </ThemedText>
            
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : users.length === 0 ? (
              <ThemedText style={styles.noUsersText}>
                No users available to share with
              </ThemedText>
            ) : (
              <ScrollView style={styles.usersList}>
                {users.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.userItem}
                    onPress={() => shareProduct(item.id, item.name)}
                    disabled={sharing}
                  >
                    <View>
                      <ThemedText>{item.name}</ThemedText>
                      <ThemedText style={styles.userEmail}>{item.email}</ThemedText>
                    </View>
                    {sharing && (
                      <ActivityIndicator color="#fff" size="small" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowShareModal(false)}
              disabled={sharing}
            >
              <ThemedText>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  actionButtons: {
    position: 'absolute',
    right: 20,
    top: '40%',
    gap: 20,
  },
  actionButton: {
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 50,
    padding: 10,
    paddingLeft: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  usersList: {
    maxHeight: 400,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  noUsersText: {
    textAlign: 'center',
    color: '#888',
    padding: 20,
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
});