"use client";

import React from "react";
import { useForm, SubmitHandler, Resolver, FieldErrors } from "react-hook-form";

interface IFormInput {
  customerName: string;
  customerNumber: string;
  customerEmail: string;
  customerAge: number;
  photo: FileList;
  aadhar: string;
}

const resolver: Resolver<IFormInput> = async (values) => {
  const errors: FieldErrors<IFormInput> = {};
  if (!values.customerName) {
    errors.customerName = {
      type: "required",
      message: "Customer Name is required.",
    };
  }
  if (!values.customerNumber) {
    errors.customerNumber = {
      type: "required",
      message: "Customer Number is required.",
    };
  }
  if (!values.customerEmail) {
    errors.customerEmail = {
      type: "required",
      message: "Customer Email is required.",
    };
  } else if (!/^\S+@\S+$/i.test(values.customerEmail)) {
    errors.customerEmail = {
      type: "pattern",
      message: "Invalid email address.",
    };
  }
  if (!values.customerAge || values.customerAge < 18) {
    errors.customerAge = {
      type: "min",
      message: "Customer Age must be at least 18.",
    };
  }
  if (!values.photo || values.photo.length === 0) {
    errors.photo = {
      type: "required",
      message: "Photo is required.",
    };
  }
  if (!values.aadhar) {
    errors.aadhar = {
      type: "required",
      message: "Aadhar is required.",
    };
  }
  return {
    values: Object.keys(errors).length === 0 ? values : {},
    errors: errors,
  };
};

const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({ resolver });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-gray-700">Customer Name</label>
        <input
          type="text"
          {...register("customerName")}
          placeholder="Enter customer name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {errors.customerName && (
          <span className="text-red-600">{errors.customerName.message}</span>
        )}
      </div>
      <div>
        <label className="block text-gray-700">Customer Number</label>
        <input
          type="text"
          {...register("customerNumber")}
          placeholder="Enter customer number"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {errors.customerNumber && (
          <span className="text-red-600">{errors.customerNumber.message}</span>
        )}
      </div>
      <div>
        <label className="block text-gray-700">Customer Email</label>
        <input
          type="email"
          {...register("customerEmail")}
          placeholder="Enter customer email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {errors.customerEmail && (
          <span className="text-red-600">{errors.customerEmail.message}</span>
        )}
      </div>
      <div>
        <label className="block text-gray-700">Customer Age</label>
        <input
          type="number"
          {...register("customerAge")}
          placeholder="Enter customer age"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {errors.customerAge && (
          <span className="text-red-600">{errors.customerAge.message}</span>
        )}
      </div>
      <div>
        <label className="block text-gray-700">Photo</label>
        <input
          type="file"
          {...register("photo")}
          accept="image/*"
          capture="environment"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {errors.photo && (
          <span className="text-red-600">{errors.photo.message}</span>
        )}
      </div>
      <div>
        <label className="block text-gray-700">Aadhar</label>
        <input
          type="text"
          {...register("aadhar")}
          placeholder="Aadhar"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {errors.aadhar && (
          <span className="text-red-600">{errors.aadhar.message}</span>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg"
      >
        Submit
      </button>
    </form>
  );
};

export default Form;
