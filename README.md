# 🥗 Smart Diet Planner

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Expo](https://img.shields.io/badge/Expo-54.0.32-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-cyan.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)

A smart, AI-powered diet planning application built with **React Native** and **Expo**. This app helps users generate personalized meal plans, track nutrition, and achieve their fitness goals using the power of **Google Gemini AI**.

## ✨ Features

- **🤖 AI-Powered Recommendations:** Generates personalized meal options based on your profile, goals, and dietary restrictions using Google Gemini AI.
- **📊 Nutritional Tracking:** Real-time tracking of calories, protein, carbs, and fats against your daily targets.
- **📝 Meal Planning:** Organize your daily meals (Breakfast, Lunch, Dinner, Snacks) with ease.
- **👤 User Profiling:** Customized plans based on age, gender, weight, height, activity level, and goals (e.g., Weight Loss, Muscle Build).
- **📈 Progress Stats:** Visualize your nutritional intake and progress with interactive charts.
- **💾 Local Persistence:** Your data is secure and saved locally on your device for privacy and offline access.
- **🌗 Modern UI:** Built with Expo Router and sleek components for a smooth user experience, supporting dark and light modes.

## 🛠 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) (via [Expo](https://expo.dev/))
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (Tab-based navigation)
- **AI Engine:** [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`)
- **Language:** TypeScript
- **State Management:** React Context API
- **Styling:** React Native Styles / CSS-in-JS
- **Icons:** Expo Vector Icons

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn
- Expo Go app on your physical device OR an Android/iOS emulator.
- **Google Gemini API Key**: You need to obtain an API key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/diet-planner.git
    cd diet-planner
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Setup API Key:**

    The app requires a valid Google Gemini API Key to generate recommendations. You will be prompted to enter this in the App Settings. ensure you have one ready.

### Running the App

1.  **Start the development server:**

    ```bash
    npx expo start
    ```

2.  **Run on device/emulator:**
    -   Scan the QR code with **Expo Go** (Android) or Camera (iOS).
    -   Press `a` for Android Emulator.
    -   Press `i` for iOS Simulator.
    -   Press `w` for Web (limited functionality).

## 📂 Project Structure

```
diet-planner/
├── app/                 # Expo Router screens and navigation
│   ├── (tabs)/          # Main tab screens (Index, Meals, Stats, Profile)
│   ├── _layout.tsx      # Root layout configuration
│   └── ...
├── components/          # Reusable UI components & Context Providers
│   ├── MealPlanContext.tsx  # Core state management
│   ├── AIFoodRecommendation.tsx # AI integration component
│   └── ...
├── services/            # Business logic and external services
│   ├── GeminiService.ts # AI integration logic
│   └── StorageService.ts # Data persistence
├── hooks/               # Custom React hooks (e.g., useColorScheme, useStorage)
├── assets/              # Images, fonts, and icons
├── constants/           # App constants and theme colors
└── services/            # API and storage services
```

## 🗺 Roadmap

- [ ] Cloud Sync & Multi-device support
- [ ] Social Sharing features
- [ ] Barcode Scanner for food logging
- [ ] Integration with HealthKit / Google Fit

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
