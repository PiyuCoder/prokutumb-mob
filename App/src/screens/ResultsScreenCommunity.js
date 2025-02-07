import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RenderUserCard from '../components/RenderUserCard';
import RenderCommunityCard from '../components/RenderCommunityCard';

const ResultsScreenCommunity = ({route, navigation}) => {
  const {results} = route.params; // Get results from navigation

  console.log(results);

  return (
    <ScrollView style={styles.container}>
      <StatusBar hidden />
      <View
        style={{
          flexDirection: 'row',
          gap: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          backgroundColor: 'white',
          padding: 25,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          paddingTop: 40,
        }}>
        <Text style={styles.title}>Search Results</Text>
      </View>

      <View style={styles.cardsContainer}>
        {results?.map((item, index) => (
          <RenderCommunityCard
            index={index}
            results
            key={item._id}
            item={item}
          />
        ))}
      </View>
      {/* <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A274FF',
    textAlign: 'left',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
});

export default ResultsScreenCommunity;
