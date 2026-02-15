import { useState } from 'react'

const LizardCard = ({ name, species, description, funFact, color }) => {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className={`lizard-card ${flipped ? 'flipped' : ''}`}
      onClick={() => setFlipped(!flipped)}
      style={{ '--card-accent': color }}
    >
      {!flipped ? (
        <div className="card-front">
          <div className="card-icon">{getEmoji(species)}</div>
          <h2>{name}</h2>
          <p className="species">{species}</p>
          <p className="description">{description}</p>
          <span className="flip-hint">Click to learn more</span>
        </div>
      ) : (
        <div className="card-back">
          <h3>Fun Fact</h3>
          <p>{funFact}</p>
          <span className="flip-hint">Click to flip back</span>
        </div>
      )}
    </div>
  )
}

function getEmoji(species) {
  const map = {
    'Gekkonidae': '\u{1F98E}',
    'Chamaeleonidae': '\u{1F98E}',
    'Iguanidae': '\u{1F98E}',
    'Varanidae': '\u{1F98E}',
    'Lacertidae': '\u{1F98E}',
  }
  return map[species] || '\u{1F98E}'
}

export default LizardCard
