import cors from "cors";
import express from "express";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/books"
mongoose.connect(mongoUrl)
//this is not needed anymore because Mongoose takes care of creating promise
// mongoose.Promise = Promise

const Author = mongoose.model('Author', {
  name: String
})

//Written like this to not get duplicates of authors(connect Atuor to Book)
const Book = mongoose.model('Book', {
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  }
})

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: "Service unavailable" })
  }
})

if (process.env.RESET_DATABASE) {
  console.log("resetting databaaaase")
  const seedDatabase = async () => {

    await Author.deleteMany()
    await Book.deleteMany()

    const tolkien = new Author({ name: 'J.R.R Tolkien' })
    await tolkien.save()
    const rowling = new Author({ name: 'J.K Rowling' })
    await rowling.save()
    const king = new Author({ name: 'Steven King' })
    await king.save()

    await new Book({ title: "Harry Potter and the Philosopher's Stone", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Chamber of Secrets", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Prisoner of Azkaban", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Goblet of Fire", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Order of the Phenix", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Half-Blood Prince", author: rowling }).save()
    await new Book({ title: "Harry Potter and the Deathly Hallows", author: rowling }).save()
    await new Book({ title: "The Lord of the Rings", author: tolkien }).save()
    await new Book({ title: "The Hobbit", author: tolkien }).save()
    await new Book({ title: "The Shining", author: king }).save()
  }
  seedDatabase()
}


// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

app.get('/authors', async (req, res) => {
  const authors = await Author.find()
  res.json(authors)
})

app.get('/authors/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)

    if (author) {
      res.json(author)
    } else {
      res.status(404).json({ error: 'Author not found' })
    }
  } catch (err) {
    res.status(400).json({ error: 'Invalid author id' })
  }

})

app.get('/authors/:id/books', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)

    if (author) {
      const books = await Book.find({ author: mongoose.Types.ObjectId.createFromHexString(author.id) })
      res.json(books)
    } else {
      res.status(404).json({ error: 'Author not found' })
    }
  } catch (err) {
    res.status(400).json({ error: 'Invalid author id' })
  }
})

app.get('/books', async (req, res) => {
  const books = await Book.find().populate('author')
  res.json(books)
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
