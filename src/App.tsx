import { Toaster } from "react-hot-toast";
import FrameGenerator from "./components/Frame/FrameGenerator";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer";
import Container from "./components/Container";
import Hero from "./components/Hero";

function App() {
  return (
    <div className="mx-auto h-screen">
      <Navbar />
      <Hero />
      <Container>
        <div className="py-10">
          <FrameGenerator />
        </div>
      </Container>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
