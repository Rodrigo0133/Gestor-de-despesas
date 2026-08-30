import mongoose, { Schema, model, connect } from "mongoose";

export async function ligarBaseDados() {
  await connect("mongodb://127.0.0.1:27017/Despesas");
  console.log("MongoDB ligado");
}

const userSchema = new Schema({
    nome: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
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
    collections: "expenses",
    timestamps: true,
  },
);
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
        collections: "categorias",
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
    collections: "receitas",
    timestamps: true,
  },
);

export const receitas = model("receitas",receitasSchema)
export const categorias = model("categorias", categoriasSchema)
export const expense = model("expenses", expenseSchema);
export const User = model("User", userSchema);
