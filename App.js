import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Icon, IconButton, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, fireStore } from "./firebase/firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState(""); //todo input field data

  //CRUD
  //auto get todos from firestore
  //read
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "todos"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTodos(data);
    });
    return () => unsubscribe();
  }, []);

  //create
  async function addTodo() {
    if (newTodo.trim() === "") {
      Alert.alert("Invalid Todo", "Please enter a valid todo.");
      return;
    }

    try {
      await addDoc(collection(db, "todos"), {
        text: newTodo,
        completed: false,
        createdAt: serverTimestamp(),
      });
      setNewTodo("");
    } catch (error) {
      Alert.alert("Error", "Failed to add todo. Please try again.");
      console.error("Error adding document: ", error);
    }
  }

  //update
  async function doneTodo(id, completed) {
    try {
      await updateDoc(doc(db, "todos", id), {
        completed: !completed,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to update todo. Please try again.");
      console.error("Error updating document: ", error);
    }
  }

  async function editTodo(id, text) {
    if (text.trim() === "") {
      Alert.alert("Invalid Todo", "Please enter a valid todo.");
      return;
    }

    try {
      await updateDoc(doc(db, "todos", id), {
        text: text,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to update todo. Please try again.");
      console.error("Error updating document: ", error);
    }
  }

  //delete
  async function deleteTodo(id) {
    try {
      await deleteDoc(doc(db, "todos", id));
    } catch (error) {
      Alert.alert("Error", "Failed to delete todo. Please try again.");
      console.error("Error deleting document: ", error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Todo List App</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter a new todo..."
          value={newTodo}
          onChangeText={setNewTodo}
          style={styles.input}
        />
        {newTodo && (
          <Button mode="contained" onPress={addTodo}>
            Add Todo
          </Button>
        )}
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ color: "gray" }}>No todos yet. Add one</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={item.completed && styles.completed}>{item.text}</Text>
            <View style={styles.buttonContainer}>
              <IconButton
                icon={item.completed ? "check-circle" : "circle-outline"}
                iconColor={item.completed ? "#2eac00" : "#7e7e7e"}
                onPress={() => doneTodo(item.id, !item.completed)}
              />
              <IconButton
                icon="pencil"
                iconColor="#007bff"
                onPress={() => editTodo(item.id, item.text)}
              />
              <IconButton
                icon="delete"
                iconColor="#ff0000"
                onPress={() => deleteTodo(item.id)}
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    gap: 10,
    marginBottom: 16,
  },
  input: {
    width: "100%",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  completed: {
    textDecorationLine: "line-through",
    color: "gray",
  },
});
