import "dotenv/config";
import mongoose, { Schema, model } from "mongoose";



export async function ligarBaseDados() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI não definida no ficheiro .env");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB ligado");
}

const userSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
},
{
    collection: "users",
    timestamps: true
});
const expenseSchema = new Schema(
  {
    descricao: {
      type: String,
      required: true,
    },
    valor: {
      type: Number,
      required: true,
    },
    data: {
      type: Date,
      default: Date.now,
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categorias",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    collection: "expenses",
    timestamps: true,
  },
);


expenseSchema.index({ userId: 1, data: -1 });

const categoriasSchema = new Schema({
    nome : {
        type: String,
        required: true
    },
    cor: {
        type: String,
        required: true
    },
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
},
{
        collection: "categorias",
        timestamps: true
})

const receitasSchema = new Schema(
  {
    descricao: {
      type: String,
      required: true,
    },
    valor: {
        type: Number,
        required: true
    },
    data: {
      type: Date,
      default: Date.now,
    },
    categoria: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    collection: "receitas",
    timestamps: true,
  },
);


receitasSchema.index({ userId: 1, data: -1 });

export const receitas = model("receitas",receitasSchema)
export const categorias = model("categorias", categoriasSchema)
export const expense = model("expenses", expenseSchema);
export const User = model("User", userSchema);
