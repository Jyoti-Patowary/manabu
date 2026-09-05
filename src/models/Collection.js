import mongoose from 'mongoose';
import { CardSchema } from './Deck';

const DeckEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cards: [CardSchema],
  },
  { timestamps: true }
);

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    decks: [DeckEntrySchema],
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Collection) {
  delete mongoose.models.Collection;
}

export default mongoose.model('Collection', CollectionSchema);