"use client";

import React from "react";
import { useForm, SubmitHandler, Resolver, FieldErrors } from "react-hook-form";
import { useGlobalContext } from "@/lib/useGlobalContext";
import toast, { ToastBar, Toaster } from "react-hot-toast";

interface IFormInput {
  name: string;
  number: string;
  email: string;
  age: number;
  photo: FileList;
  aadhar: FileList;
  bed: string;
}

const resolver: Resolver<IFormInput> = async (values) => {
  const errors: FieldErrors<IFormInput> = {};
  if (!values.name) {
    errors.name = {
      type: "required",
      message: "Customer Name is required.",
    };
  }

  if (!values.bed) {
    errors.bed = {
      type: "required",
      message: "Bed is required.",
    };
  }
  if (!values.number) {
    errors.number = {
      type: "required",
      message: "Customer Number is required.",
    };
  }
  if (values.email && !/^\S+@\S+$/i.test(values.email)) {
    errors.email = {
      type: "pattern",
      message: "Invalid email address.",
    };
  }
  if (!values.age || values.age < 18) {
    errors.age = {
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
  if (!values.aadhar || values.aadhar.length === 0) {
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
  const { allocateBed, getBeds, beds, getCustomerDetails, customer } =
    useGlobalContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<IFormInput>({ resolver });

  const onSubmit: SubmitHandler<IFormInput> = (values) => {
    toast
      .promise(
        allocateBed(values),
        {
          loading: "Allocating bed Please wait",
          success: () => `Bed Allocated`,
          error: (err) => `${err.toString()}`,
        },
        {
          style: {
            minWidth: "250px",
          },
          success: {
            duration: 5000,
            icon: "🔥",
          },
          error: {
            duration: 5000,
            icon: "🛑",
          },
        }
      )
      .then(() => {
        getBeds();
        reset();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const number = e.target.value;
      if (number.length === 10) {
        const { customer } = await getCustomerDetails(number);

        if (customer) {
          setValue("name", customer.name);
          setValue("email", customer.email || "");
          setValue("age", customer.age);

          console.log(customer);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to get users data");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-gray-700">Customer Number</label>
        <input
          type="text"
          {...register("number")}
          placeholder="Enter customer number"
          onChange={handleNumberChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {errors.number && (
          <span className="text-red-600">{errors.number.message}</span>
        )}
      </div>
      <div>
        <label className="block text-gray-700">Customer Name</label>
        <input
          type="text"
          {...register("name")}
          placeholder="Enter customer name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {errors.name && (
          <span className="text-red-600">{errors.name.message}</span>
        )}
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Bed</label>
        <select
          {...register("bed")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-150"
        >
          <option value="" disabled>
            Select a Bed
          </option>
          {beds.map((bed: any) => (
            <option
              key={bed._id}
              value={bed.bed}
              disabled={bed.isOccupied}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              {bed.bed}
            </option>
          ))}
        </select>
        {errors.bed && (
          <span className="text-red-600 mt-1 text-sm">
            {errors.bed.message}
          </span>
        )}
      </div>

      <div>
        <label className="block text-gray-700">Customer Email</label>
        <input
          type="email"
          {...register("email")}
          placeholder="Enter customer email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {errors.email && (
          <span className="text-red-600">{errors.email.message}</span>
        )}
      </div>
      <div>
        <label className="block text-gray-700">Customer Age</label>
        <input
          type="number"
          {...register("age")}
          placeholder="Enter customer age"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {errors.age && (
          <span className="text-red-600">{errors.age.message}</span>
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
          type="file"
          accept="image/*"
          capture="environment"
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
      <Toaster>
        {(t) => (
          <ToastBar
            toast={t}
            style={{
              ...t.style,
              animation: t.visible
                ? "custom-enter 1s ease"
                : "custom-exit 1s ease",
            }}
          />
        )}
      </Toaster>
    </form>
  );
};

export default Form;
