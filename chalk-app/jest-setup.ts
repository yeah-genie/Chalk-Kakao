import '@testing-library/jest-native/extend-expect';

// Mocking required for Supabase and other native modules
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Add custom mocks here as needed
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
    Link: 'Link',
}));
