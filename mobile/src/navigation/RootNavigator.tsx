import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { SplashScreen } from "../screens/SplashScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { AttendanceHomeScreen } from "../screens/AttendanceHomeScreen";
import { ScanScreen } from "../screens/ScanScreen";
import { SelfieScreen } from "../screens/SelfieScreen";
import { TasksScreen } from "../screens/TasksScreen";
import { InstructorTasksScreen } from "../screens/InstructorTasksScreen";
import { AssignTaskScreen } from "../screens/AssignTaskScreen";
import { TaskRosterScreen } from "../screens/TaskRosterScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Attendance" component={AttendanceHomeScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="Selfie" component={SelfieScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
        <Stack.Screen name="InstructorTasks" component={InstructorTasksScreen} />
        <Stack.Screen name="AssignTask" component={AssignTaskScreen} />
        <Stack.Screen name="TaskRoster" component={TaskRosterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
