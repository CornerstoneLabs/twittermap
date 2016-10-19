"""Test location."""
import location

import unittest


class TestLocationSearch(unittest.TestCase):
    """Test locations."""

    def test_single_word_exeter(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Exeter')

        self.assertEqual(result['country'], 'England')

    def test_single_word_salisbury(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Salisbury')

        self.assertEqual(result['country'], 'England')

    def test_single_word_swanage(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Swanage')

        self.assertEqual(result['country'], 'England')

    def test_single_word_boston(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Boston')

        self.assertEqual(result['country'], 'England')

    def test_double_word_coombe_martin(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Coombe Martin')

        self.assertEqual(result['country'], 'England')

    def test_triple_word_weston_super_mare(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Weston Super Mare')

        self.assertEqual(result['country'], 'England')

if __name__ == '__main__':
    unittest.main()
