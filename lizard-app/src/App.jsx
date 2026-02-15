import { useState } from 'react'
import LizardCard from './components/LizardCard'
import './App.css'

const lizards = [
  {
    name: 'Leopard Gecko',
    species: 'Gekkonidae',
    description:
      'A small, docile gecko popular as a pet. Known for their spotted patterns and fat tails that store nutrients.',
    funFact:
      'Leopard geckos can detach their tails when threatened and regrow them — though the new tail is never quite the same shape.',
    color: '#f0c040',
  },
  {
    name: 'Panther Chameleon',
    species: 'Chamaeleonidae',
    description:
      'One of the most colorful lizards on Earth. Males display vibrant blues, greens, and reds depending on their locale.',
    funFact:
      'Chameleons don\'t change color to blend in — they change color to communicate mood, regulate temperature, and signal to rivals.',
    color: '#40c080',
  },
  {
    name: 'Green Iguana',
    species: 'Iguanidae',
    description:
      'A large herbivorous lizard native to Central and South America. They can grow over 5 feet long including their tail.',
    funFact:
      'Green iguanas have a "third eye" on top of their head called a parietal eye that detects changes in light and shadow.',
    color: '#60b040',
  },
  {
    name: 'Komodo Dragon',
    species: 'Varanidae',
    description:
      'The largest living lizard, found in Indonesia. They can weigh over 150 pounds and run in short bursts up to 13 mph.',
    funFact:
      'Komodo dragons have venom glands that deliver toxins inhibiting blood clotting, causing their prey to go into shock.',
    color: '#a08050',
  },
  {
    name: 'European Wall Lizard',
    species: 'Lacertidae',
    description:
      'A small, agile lizard commonly seen basking on walls and rocks across southern Europe.',
    funFact:
      'Introduced to Cincinnati, Ohio in the 1950s by a boy who brought them back from Italy — they still thrive there today.',
    color: '#7090c0',
  },
]

function App() {
  const [filter, setFilter] = useState('All')
  const families = ['All', ...new Set(lizards.map((l) => l.species))]

  const displayed = filter === 'All' ? lizards : lizards.filter((l) => l.species === filter)

  return (
    <div className="app">
      <header>
        <h1>Lizard Field Guide</h1>
        <p className="subtitle">Click any card to reveal a fun fact</p>
      </header>

      <nav className="filter-bar">
        {families.map((f) => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f === 'All' ? 'All Lizards' : f}
          </button>
        ))}
      </nav>

      <main className="card-grid">
        {displayed.map((lizard) => (
          <LizardCard key={lizard.name} {...lizard} />
        ))}
      </main>

      <footer>
        <p>Built with React &middot; {lizards.length} species cataloged</p>
      </footer>
    </div>
  )
}

export default App
