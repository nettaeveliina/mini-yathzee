import Home from "./Screens/Home";
import Gameboard from "./Screens/Gameboard";
import Scoreboard from "./Screens/Scoreboard";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome"; // Import the FontAwesome icon

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        sceneContainerStyle={{ backgroundColor: "Transparent" }}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home";
            } else if (route.name === "Gameboard") {
              iconName = focused ? "gamepad" : "gamepad";
            } else if (route.name === "Scoreboard") {
              iconName = focused ? "pencil" : "pencil";
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "rosybrown",
          tabBarInactiveTintColor: "black",
        })}
      >
        <Tab.Screen name="Home" component={Home} options={{ tabBarStyle: { display: "none" } }} />
        <Tab.Screen name="Gameboard" component={Gameboard} />
        <Tab.Screen name="Scoreboard" component={Scoreboard} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
