process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');

let book;

beforeEach(async () => {
    let result = await db.query(`
    INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES ('123456789', 'https://amazon.com/cat', 'Test Author', 'ENG', 100, 'Test Publishers', 'Test Title', 2000)
    RETURNING isbn`);
    book = result.rows[0];
})

describe('get routes', function(){
    test('get all books', async () => {
        const res = await request(app).get('/books');
        const books = res.body.books;
        expect(res.status).toEqual(200);
        expect(books).toHaveLength(1);
    });
    test('get single book by isbn', async() => {
        const res = await request(app).get(`/books/${book.isbn}`);
        expect(res.status).toEqual(200);
        expect(res.body.book).toHaveProperty(`isbn`);
        expect(res.body.book.isbn).toEqual(book.isbn);
    });
    test('return 404 if isbn nonexistent', async() => {
        const res = await request(app).get(`/books/0`);
        expect(res.status).toEqual(404);
    });
});

describe('post routes', function(){
    test('adds new book', async() =>{
        const res = await request(app).post(`/books`).send({
            isbn: '246810',
            amazon_url: 'https://amazon.com/dog',
            author: 'Test2', 
            language: 'Test2', 
            pages: 200, 
            publisher: 'Test2', 
            title: 'Test2', 
            year: 2000
        });
        expect(res.status).toEqual(201);
        expect(res.body.book).toHaveProperty(`isbn`);
    });
    test('prevents creation of book when missing data', async() => {
        const res = await request(app).post(`/books`).send({
            amazon_url: 'https://amazon.com/bird',
            author: 'Test3', 
            language: 'Test3', 
            pages: 300, 
            publisher: 'Test3', 
            title: 'Test3', 
            year: 2000
        });
        expect(res.status).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });
});

describe('put routes', function(){
    test('edits book', async() =>{
        const res = await request(app).put(`/books/123456789`).send({
            isbn: '246810',
            amazon_url: 'https://amazon.com/dog',
            author: 'Test2', 
            language: 'Test2', 
            pages: 200, 
            publisher: 'Test2', 
            title: 'Test2', 
            year: 2000
        });
        expect(res.status).toEqual(200);
        expect(res.body.book).toHaveProperty(`isbn`);
    });
    test('return 404 if isbn nonexistent', async() => {
        const res = await request(app).put(`/books/0`).send({
            isbn: '246810',
            amazon_url: 'https://amazon.com/dog',
            author: 'Test2', 
            language: 'Test2', 
            pages: 200, 
            publisher: 'Test2', 
            title: 'Test2', 
            year: 2000
        });
        expect(res.status).toEqual(404);
    });
    test('prevents edit of book when missing data', async() => {
        const res = await request(app).put(`/books/123456789`).send({
            amazon_url: 'https://amazon.com/bird',
            author: 'Test3', 
            language: 'Test3', 
            pages: 300, 
            publisher: 'Test3', 
            title: 'Test3', 
            year: 2000
        });
        expect(res.status).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });
});

describe('delete routes', function(){
    test('deletes a book', async() => {
        const res = await request(app).delete(`/books/123456789`);
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual('Book deleted');
    });
});

afterEach(async() => {
    await db.query(`DELETE FROM books`);
});

afterAll(async () => {
    await db.end();
});