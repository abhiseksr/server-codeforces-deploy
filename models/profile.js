const { Schema } = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const profileSchema = Schema({
    username: {
        type: String,
        default: "NOT FILLED"
    },
    fullName: {
        type: String,
        default: "NOT FILLED"
    },
    email: {
        type: String,
        default: "NOT FILLED"
    },
    collegeName: {
        type: String,
        default: "NOT FILLED"
    },
    yearOfStudy: {
        type: Number,
        default: 1
    },
    department: {
        type: String,
        default: "NOT FILLED"
    },
    country: {
        type: String,
        default: "India"
    },
    address: {
        type: String,
        default: "NOT FILLED"
    },
    phone: {
        type: String,
        default: "NOT FILLED"
    },
    speakingLanguages: {
        type: String,
        default: "English"
    },
    skills: {
        type: String,
        default: "NOT FILLED"
    },
    githubProfile: {
        type: String,
        default: "NOT FILLED"
    },
    linkedInProfile: {
        type: String,
        default: "NOT FILLED"
    },
    availability: {
        type: String,
        default: "NOT FILLED"
    },
    cgpa: {
        type: Number,
        default: 0
    },
    tShirtSize: {
        type: String,
        default: "M"
    },
    preferredCommunication: {
        type: String,
        default: "Email"
    },
    resume: {
        type: String,
        default: "NOT PROVIDED"
    },
    otherInterests: {
        type: String,
        default: "NOT FILLED"
    },
    projectPortfolio: {
        type: String,
        default: "NOT PROVIDED"
    }
});

const companyProfileSchema = Schema({
    username: {
        type: String,
        default: "NOT FILLED"
    },
    companyId: {
        type: String,
        default: uuidv4
    },
    companyName: {
        type: String,
        default: "NOT FILLED"
    },
    email: {
        type: String,
        default: "NOT FILLED"
    },
    phone: {
        type: String,
        default: "NOT FILLED"
    },
    cgpaCutOff: {
        type: Number,
        default: 0
    },
    monitorCandidatesLocation: {
        type: Number,
        default: 0
    },
    eligibleBranches: {
        type: [String],
        default: []
    },
    maxExcursion: {
        type: Number,
        default: 100000000
    },
    workLocations: {
        type: String,
        default: "NOT FILLED"
    },
    termsOfAgreement: {
        type: String,
        default: "NOT FILLED"
    },
    package: {
        type: String,
        default: "0"
    },
    jobTitle: {
        type: String,
        default: "NOT FILLED"
    },
    jobDescription: {
        type: String,
        default: "NOT FILLED"
    },
    applicationDeadline: {
        type: Date,
        default: Date.now
    }
});

module.exports = { profileSchema, companyProfileSchema };
