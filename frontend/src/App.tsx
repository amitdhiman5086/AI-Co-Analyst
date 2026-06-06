import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import { ProtectedRoute } from "./components/protected-route";
import { Login } from "./pages/login";
import { ChatLayout } from "./pages/chat-layout";
import { ChatEmpty } from "./pages/chat-empty";
import { ChatThread } from "./pages/chat-thread";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatLayout />}>
              <Route index element={<ChatEmpty />} />
              <Route path=":threadId" element={<ChatThread />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
