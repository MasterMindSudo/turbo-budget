# Budget App

This is a family/personal budgeting and bill-splitting web application built with Next.js 14 (App Router) and Material UI v5. It's designed to be mobile-first and uses a lightweight client context for state management with mock data, ready for future Firebase integration.

## Project Structure

```
.
├── public/
├── src/
│   ├── app/
│   │   ├── groups/
│   │   │   ├── [groupId]/
│   │   │   │   ├── expense/
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx      # New Expense (full form)
│   │   │   │   │   └── new-simple/
│   │   │   │   │       └── page.tsx  # New Expense (compact)
│   │   │   │   └── page.tsx          # Home / Dashboard
│   │   ├── rooms/
│   │   │   └── page.tsx            # Room List
│   │   ├── budget/
│   │   │   └── page.tsx            # Budget Page (Placeholder)
│   │   ├── list/
│   │   │   └── page.tsx            # List Page (Placeholder)
│   │   ├── todo/
│   │   │   └── page.tsx            # To-Do Page (Placeholder)
│   │   ├── client-app-layout.tsx   # Client component for App Shell (AppBar, BottomNav)
│   │   ├── layout.tsx              # Root layout for MUI theme, CssBaseline, BudgetProvider
│   │   └── page.tsx                # Root redirect to /groups/group1
│   ├── components/
│   │   └── shared/                 # Reusable UI components
│   │       ├── AvatarStack.tsx
│   │       ├── CurrencyField.tsx
│   │       ├── GradientButton.tsx
│   │       ├── LineChartCard.tsx
│   │       └── MemberListItem.tsx
│   ├── context/
│   │   └── BudgetProvider.tsx      # React Context + useReducer for global state
│   ├── lib/
│   │   └── data.ts                 # Dummy data and helper functions
│   ├── styles/
│   │   ├── globals.css             # Global CSS styles
│   │   └── theme.ts                # Material UI theme configuration
│   └── 
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Install Dependencies

Make sure you have Node.js (v18 or higher) and npm/pnpm installed. Then, install the project dependencies:

```bash
pnpm install
# or
npm install
```

### 2. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

Pages:
- **Home/Dashboard**: `/groups/group1` (default redirect from `/`)
- **Room List**: `/rooms`
- **New Expense (Full Form)**: `/groups/group1/expense/new`
- **New Expense (Compact)**: `/groups/group1/expense/new-simple`
- **List Page (Placeholder)**: `/list`
- **Budget Page (Placeholder)**: `/budget`
- **To-Do Page (Placeholder)**: `/todo`

### 3. Build for Production

```bash
pnpm build
# or
npm run build
```

### 4. Start Production Server

```bash
pnpm start
# or
npm start
```

## Firebase Integration (TODO)

This project uses a client-side context with mock data for UI demonstration. To integrate with Firebase, you will need to:

1.  **Set up Firebase Project**: Initialize Firebase in your project and configure Firebase Authentication and Firestore.
2.  **Update `src/context/BudgetProvider.tsx`**: Replace mock data fetching and data manipulation functions with actual calls to Firebase Authentication and Firestore SDKs.
3.  **Implement Firebase Hooks/Utilities**: Create utility functions or custom hooks in `src/lib/firebase/` (or similar) to abstract Firebase interactions.
4.  **Security Rules & Indexes**: Ensure your Firestore security rules and indexes (as defined in `firestore.rules` and `firestore.indexes.json`) are deployed to allow correct data access.
5.  **Firebase Storage**: For receipt image uploads, integrate Firebase Storage.

Look for `TODO ⇢ Firebase` comments in the code for specific integration points.
