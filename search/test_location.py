"""Test location."""
import location
import unittest


class TestWeighting(unittest.TestCase):
    """Test intersection match."""

    def test_single_word(self):
        """Should return a list of one word."""
        score = location.match_weight('clevedon', ['clevedon'])

        self.assertEqual(score, 1000)

    def test_single_word_with_junk(self):
        """Should return a list of two words."""
        score = location.match_weight('clevedon UK', ['clevedon'])

        self.assertEqual(score, 1000)

    def test_multiple_word(self):
        """Should return a list of multiple words."""
        score = location.match_weight('weston super mare UK', ['weston super mare'])

        self.assertEqual(score, 1000)


class TestLocationSearch(unittest.TestCase):
    """Test locations."""

    def test_single_word_exeter(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Exeter GB')

        self.assertEqual(result['country'], 'GB')

    def test_single_word_salisbury(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Salisbury GB')

        self.assertEqual(result['country'], 'GB')

    def test_single_word_swanage(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Swanage GB')

        self.assertEqual(result['country'], 'GB')

    def test_single_word_boston(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Boston GB')

        self.assertEqual(result['country'], 'GB')

    def test_double_word_coombe_martin(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Combe Martin GB')

        self.assertEqual(result['country'], 'GB')

    def test_triple_word_weston_super_mare(self):
        """Lookup with a single word town name."""
        result = location.lookup_location('Weston Super Mare GB')

        self.assertEqual(result['country'], 'GB')

if __name__ == '__main__':
    unittest.main()
