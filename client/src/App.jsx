import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import BuyAdopt from "./pages/BuyAdopt";
import RentAFriend from "./pages/RentAFriend";
import MeetAVet from "./pages/MeetAVet";
import VetBooking from "./pages/VetBooking";
import StrayFeed from "./pages/StrayFeed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PetDetails from "./pages/PetDetails";
import VetOnboarding from "./pages/VetOnboarding";
import VetDashboard from "./pages/VetDashboard";
import MyActivity from "./pages/MyActivity";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/buy-adopt" element={<BuyAdopt />} />
        <Route path="/rent-a-friend" element={<RentAFriend />} />
        <Route path="/pets/:id" element={<PetDetails />} />
        <Route path="/meet-a-vet" element={<MeetAVet />} />
        <Route path="/vet/book/:id" element={<VetBooking />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/my-activity" element={<MyActivity />} />
          <Route path="/vet/onboard" element={<VetOnboarding />} />
          <Route path="/vet/dashboard" element={<VetDashboard />} />
        </Route>
        <Route path="/stray-feed" element={<StrayFeed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
    </Routes>
  );
}

export default App;
