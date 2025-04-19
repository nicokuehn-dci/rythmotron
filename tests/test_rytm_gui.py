import unittest
from src.rythmotron.ui.rytm_gui import RytmGui

class TestRytmGui(unittest.TestCase):
    def setUp(self):
        self.gui = RytmGui()

    def test_initialization(self):
        """Test that the GUI initializes correctly."""
        self.assertIsNotNone(self.gui)

    def test_render(self):
        """Test that the render method works without errors."""
        try:
            self.gui.render()
        except Exception as e:
            self.fail(f"Render method raised an exception: {e}")

if __name__ == "__main__":
    unittest.main()