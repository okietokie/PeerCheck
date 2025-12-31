import mongoose from 'mongoose';

const tourguideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: Map,
        of: Boolean,
        default:{}
    }
})

const TourGuideInfo = mongoose.model("TourGuideInfo", tourguideSchema);
export default TourGuideInfo;