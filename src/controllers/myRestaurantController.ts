import { Request, Response } from "express"
import { Restaurant } from "../models/restaurant"
import mongoose from "mongoose"
import { imagekit } from "../index"

const createMyRestaurant = async (req: Request, res: Response) => {
    try{
        const existingRestaurant = await Restaurant.findOne({
            user: req.userId
        })
        if(existingRestaurant){
            return res.status(409).json({ message: "User restaurant already exists" })
        }
        const image = req.file as Express.Multer.File
        const base64Image = Buffer.from(image.buffer).toString("base64")
        const dataURI = `data:${image.mimetype};base64,${base64Image}`

        imagekit.upload({
            file : dataURI, //required
            fileName : "test_image",   //required
            extensions: [
                {
                    name: "google-auto-tagging",
                    maxTags: 5,
                    minConfidence: 95
                }
            ],
            transformation: {
                pre: 'l-text,i-Imagekit,fs-50,l-end',
                post: [
                    {
                        type: 'transformation',
                        value: 'w-100'
                    }
                ]
            }
        }, async function(error, result) {
            if(error) console.log(error);
            else{
                const restaurant = new Restaurant(req.body)
                restaurant.imageUrl = result?.url as string
                restaurant.user = new mongoose.Types.ObjectId(req.userId)
                restaurant.lastUpdated = new Date()
                await restaurant.save()
                res.status(201).send(restaurant)
            }
        });
    }catch(error){
        console.log(error)
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const getMyRestaurant = async (req: Request, res: Response) => {
    try{
        const restaurant = await Restaurant.findOne({
            user: req.userId
        })
        if(!restaurant){
            return res.status(404).json({ message: "Restaurant not found" })
        }
        return res.json(restaurant)
    } catch (error){
        console.log(error)
        return res.status(500).json({ message: "Error fetching restaurant" })
    }
}

export const updateMyRestaurant = async(req: Request, res: Response) => {
    try{
        const restaurant = await Restaurant.findOne({
            user: req.userId
        })
        if(!restaurant){
            return res.status(404).json({ message: "Restaurant not found" })
        }
        restaurant.restaurantName = req.body.restaurantName;
        restaurant.city = req.body.city;
        restaurant.country = req.body.country;
        restaurant.deliveryPrice = req.body.deliveryPrice;
        restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
        restaurant.cuisines = req.body.cuisines;
        restaurant.menuItems = req.body.menuItems;
        restaurant.lastUpdated = new Date();
        if(req.file){
            const image = req.file as Express.Multer.File
            const base64Image = Buffer.from(image.buffer).toString("base64")
            const dataURI = `data:${image.mimetype};base64,${base64Image}`
            imagekit.upload({
                file : dataURI, //required
                fileName : "test_image",   //required
                extensions: [
                    {
                        name: "google-auto-tagging",
                        maxTags: 5,
                        minConfidence: 95
                    }
                ],
                transformation: {
                    pre: 'l-text,i-Imagekit,fs-50,l-end',
                    post: [
                        {
                            type: 'transformation',
                            value: 'w-100'
                        }
                    ]
                }
            }, async function(error, result) {
                if(error) console.log(error);
                else{
                    restaurant.imageUrl = result?.url as string
                }
            });
        }
        await restaurant.save()
        return res.status(200).send(restaurant)
    } catch(error) {
        console.log(error)
        return res.status(500).json({ message: "Something went wrong while updating restaurant" })
    }
}

export default {
    createMyRestaurant,
    getMyRestaurant,
    updateMyRestaurant
}