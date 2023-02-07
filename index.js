require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');




app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fpgnyx0.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const postCollection = client.db('Banao_mern_stack').collection('posts')
        const catagoryCollection = client.db('Banao_mern_stack').collection('Catagory')
        const usersCollection = client.db('Banao_mern_stack').collection('users')


        // Catagories
        app.get('/catagory', async (req, res) => {
            const query = {}
            const result = await catagoryCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const query = {}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })




        app.get('/loginuser/:username', async (req, res) => {
            const username = req.params.username;
            const query = { username: username }
            const userdata = await usersCollection.findOne(query)

            if (userdata) {

                return res.send({ data: userdata })
            }
            else {
                
                return res.send({ data: {} })
            }
        })

        app.put("/user/:username", async (req, res) => {
            try {
                const username = req.params.username;

                // check the req
                const query = { username: username }
                const existingUser = await usersCollection.findOne(query)

                if (existingUser) {
                    const data = {
                        status: 'userExists'
                    }
                    return res.send({ data: data })
                }

                else {

                    const user = req.body;
                   
                    const result = await usersCollection.insertOne(user);

                    const data = {
                        status: 'user Created'
                    }

                    return res.send({ data: result, data: data })

                }



            }
            catch (err) {
                console.log(err)
            }
        })


        // CRUD FOR SOCIAL MEDIA POST

        // 1. Create a Post
        app.post('/createpost', async (req, res) => {
            const body = req.body;
            const result = await postCollection.insertOne(body)
            res.send(result)
        })

        // 2. Read all post
        app.get('/posts', async (req, res) => {
            const query = {}
            const result = await postCollection.find(query).toArray()
            res.send(result)
        })
        // Read Single Post
        app.get('/post/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            const query = { "_id": id }
            const result = await postCollection.findOne(query)
            res.send(result)
        })

        // 3. Update a post
        app.put('/updatepost/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);

            const body = req.body
            const filter = { "_id": id }
            const option = { upsert: true }

            const result = await postCollection.replaceOne(filter, body, option)
            res.send(result)

        })

        // 4.delete a post
        app.delete('/deletepost/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            const query = { "_id": id }
            const result = await postCollection.deleteOne(query)
            res.send(result)
        })

        // Add Likes and comments to post
        app.put('/likepost/:id', async (req, res) => {
            const id = req.params.id
            const body = req.body
            const filter = { _id: new ObjectId(id) }

            // finding the post
            const likedpost = await postCollection.findOne(filter)

            // checking the like is exist or not
            const likeExited = likedpost.likes.find(likedata => likedata.userEmail === body.userEmail)
            console.log(likeExited)
          
            if (likeExited) {
                // if exist then remove the like
                const removedlike = likedpost.likes.filter(like => like.userEmail !== body.userEmail)

                console.log(removedlike);
                const updateDoc = {
                    $set: {
                        likes: [...removedlike]
                    }
                }

                const option = { upsert: true }
                const result = await postCollection.updateOne(filter, updateDoc, option)
                res.send(result)

                return

            }
            else {
                const updateDoc = {
                    $set: {
                        likes: [...likedpost.likes, body]
                    }
                }
                const option = { upsert: true }
                const result = await postCollection.updateOne(filter, updateDoc, option)
                res.send(result)
                return
            }




        })


        // add Comments
        app.put('/comments/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const body = req.body
            const post = await postCollection.findOne(query)

            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    comments: [...post.comments, body]
                }
            }
            const result = await postCollection.updateOne(query, updateDoc, option)
            res.send(result)
        })

    }
    catch {

    }
    finally {

    }
}

run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Hello Word')

})
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})