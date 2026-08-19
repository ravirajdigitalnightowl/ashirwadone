import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

interface Props { navigation: any; }

const { width } = Dimensions.get('window');

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true })
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="city-variant-outline" size={80} color={theme.primary} />
          </View>
          <Text style={styles.title}>Ashirwad Society</Text>
          <Text style={styles.subtitle}>Your smart digital community hub. Connect, report issues, and stay updated with your society.</Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.primaryBtn} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryBtnText}>GET STARTED</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.secondaryBtn} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryBtnText}>I'M NEW HERE</Text>
          </TouchableOpacity> */}
        </Animated.View>

      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.background 
  },
  content: { 
    flex: 1, 
    padding: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingBottom: 40 
  },
  
  logoContainer: { 
    alignItems: 'center',
    marginBottom: 60
  },
  iconCircle: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    backgroundColor: theme.primaryLight, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 30, 
    shadowColor: theme.primary, 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 20, 
    elevation: 10 
  },
  title: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: theme.textMain, 
    marginBottom: 12, 
    textAlign: 'center', 
    letterSpacing: 0.5 
  },
  subtitle: { 
    fontSize: 16, 
    color: theme.textMuted, 
    textAlign: 'center', 
    lineHeight: 24, 
    paddingHorizontal: 10 
  },
  
  buttonContainer: { 
    width: '100%' 
  },
  primaryBtn: { 
    backgroundColor: theme.primary, 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 16, 
    shadowColor: theme.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  primaryBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '800', 
    letterSpacing: 1 
  },
  secondaryBtn: { 
    backgroundColor: 'transparent', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: theme.border 
  },
  secondaryBtnText: { 
    color: theme.textMain, 
    fontSize: 16, 
    fontWeight: '800', 
    letterSpacing: 1 
  },
});

export default WelcomeScreen;