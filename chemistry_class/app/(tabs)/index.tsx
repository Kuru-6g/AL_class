import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView
} from 'react-native';

// Add type for the ref to fix TypeScript error
import type { FlatList as RNFlatList, FlatListProps } from 'react-native';
import {Ionicons} from "@expo/vector-icons";

type FlatListRef = RNFlatList<Message>;

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type PredefinedQuestion = {
  question: string;
  answer: string;
};

const PREDEFINED_QUESTIONS: PredefinedQuestion[] = [
  {
    question: 'What classes are available?',
    answer: 'We currently offer Chemistry 101 (Mondays & Wednesdays 10-11:30 AM) and Physics 201 (Tuesdays & Thursdays 2-3:30 PM).',
  },
  {
    question: 'How much does a class cost?',
    answer: 'Each class costs $30. We also offer package deals: 5 classes for $125 or 10 classes for $240.',
  },
  {
    question: 'What is the schedule for Chemistry 101?',
    answer: 'Chemistry 101 is held every Monday and Wednesday from 10:00 AM to 11:30 AM.',
  },
  {
    question: 'Who are the teachers?',
    answer: 'Our Chemistry classes are taught by Dr. Smith, and Physics classes are taught by Prof. Johnson.',
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your virtual assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatListRef>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Find matching predefined question
    const userInput = inputText.toLowerCase();
    const matchedQuestion = PREDEFINED_QUESTIONS.find(q => 
      userInput.includes(q.question.toLowerCase().split(' ')[0]) ||
      q.question.toLowerCase().includes(userInput.split(' ')[0])
    );

    // Add bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: matchedQuestion 
          ? matchedQuestion.answer 
          : 'I\'m not sure how to answer that. Here are some questions I can help with:',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View 
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={[
        styles.messageText,
        item.sender === 'user' && styles.userMessageText
      ]}>
        {item.text}
      </Text>
      <Text style={[
        styles.timestamp,
        item.sender === 'user' && styles.userTimestamp
      ]}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const handleSuggestionPress = (question: string) => {
    setInputText(question);
    handleSend();
  };

  const renderSuggestions = (isInitial = false) => {
    return (
      <View style={[styles.suggestionsContainer, isInitial ? styles.initialSuggestions : {}]}>
        <View style={[styles.messageBubble, styles.botBubble, styles.suggestionBubble]}>
          <Text style={styles.suggestionTitle}>
            {isInitial ? 'How can I help you?' : 'Would you like to know anything else?'}
          </Text>
          <View style={styles.suggestionsGrid}>
            {PREDEFINED_QUESTIONS.map((q, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.suggestionButton}
                onPress={() => handleSuggestionPress(q.question)}
              >
                <Text style={styles.suggestionText}>{q.question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Virtual Assistant</Text>
      </View>

      <FlatList<Message>
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={messages.length === 1 ? renderSuggestions(true) : undefined}
        ListFooterComponent={messages.length > 1 ? renderSuggestions(false) : undefined}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    alignSelf: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: '#9c84c5',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  userMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'right',
    color: '#666',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  suggestionsContainer: {
    padding: 16,
    paddingBottom: 8,
    alignItems: 'flex-start',
    width: '100%',
  },
  initialSuggestions: {
    paddingTop: 0,
    marginTop: -8,
  },
  suggestionBubble: {
    maxWidth: '90%',
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -4, // Negative margin to create gap effect
  },
  suggestionButton: {
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    margin: 4, // Add margin to create gap effect
  },
  suggestionText: {
    color: '#000000',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8b64bd',
    justifyContent: 'center',
    alignItems: 'center',
  },

});
