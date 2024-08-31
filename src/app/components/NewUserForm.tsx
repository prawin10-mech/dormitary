"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler, Resolver, FieldErrors } from "react-hook-form";
import { useGlobalContext } from "@/lib/useGlobalContext";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import Image from "next/image";

interface IFormInput {
  name: string;
  number: string;
  email: string;
  age: number;
  photo: FileList;
  aadharFront: FileList;
  aadharBack: FileList;
  bed: string;
  period: string;
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

  if (values.number && !/^\d+$/i.test(values.number)) {
    errors.number = {
      type: "pattern",
      message: "Invalid number format. Only digits are allowed.",
    };
  }

  if (!values.period) {
    errors.number = {
      type: "required",
      message: "Period is required.",
    };
  }
  if (values.email && !/^\S+@\S+$/i.test(values.email)) {
    errors.email = {
      type: "pattern",
      message: "Invalid email address.",
    };
  }
  if (!values.age || values.age < 16) {
    errors.age = {
      type: "min",
      message: "Customer Age must be at least 16.",
    };
  }

  if (!values.photo || values.photo.length === 0) {
    errors.photo = {
      type: "required",
      message: "Photo is required.",
    };
  }
  if (!values.aadharFront || values.aadharFront.length === 0) {
    errors.aadharFront = {
      type: "required",
      message: "Aadhar Front is required.",
    };
  }

  if (!values.aadharBack || values.aadharBack.length === 0) {
    errors.aadharBack = {
      type: "required",
      message: "Aadhar Back is required.",
    };
  }

  return {
    values: Object.keys(errors).length === 0 ? values : {},
    errors: errors,
  };
};

const Form = () => {
  const { allocateBed, getBeds, beds, getCustomerDetails } = useGlobalContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<IFormInput>({ resolver });

  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null
  );

  const [aadharFrontPreview, setAadharFrontPreview] = useState<
    string | ArrayBuffer | null
  >(null);

  const [aadharBackPreview, setAadharBackPreview] = useState<
    string | ArrayBuffer | null
  >(null);

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
      .then(({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        getBeds();
        setAadharFrontPreview(null);
        setAadharBackPreview(null);
        setImagePreview(null);
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
          setValue("bed", customer.bed.bed);
          setValue("period", customer.period);

          if (customer.photo) {
            const photoBlob = await fetch(customer.photo).then((res) =>
              res.blob()
            );
            const photoFile = new File([photoBlob], "photo.jpg", {
              type: photoBlob.type,
            });
            setValue("photo", [photoFile] as unknown as FileList);
            setImagePreview(URL.createObjectURL(photoBlob));
          }

          // Fetch and set aadhar preview
          if (customer.aadharFront) {
            const aadharBlob = await fetch(customer.aadharFront).then((res) =>
              res.blob()
            );
            const aadharFile = new File([aadharBlob], "aadhar_front.jpg", {
              type: aadharBlob.type,
            });
            setValue("aadharFront", [aadharFile] as unknown as FileList);
            setAadharFrontPreview(URL.createObjectURL(aadharBlob));
          }

          if (customer.aadharBack) {
            const aadharBlob = await fetch(customer.aadharBack).then((res) =>
              res.blob()
            );
            const aadharFile = new File([aadharBlob], "aadhar_back.jpg", {
              type: aadharBlob.type,
            });
            setValue("aadharBack", [aadharFile] as unknown as FileList);
            setAadharBackPreview(URL.createObjectURL(aadharBlob));
          }
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to get user data");
    }
  };

  const onFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: String
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "Photo") {
          setImagePreview(reader.result);
        } else if (type === "aadharFront") {
          setAadharFrontPreview(reader.result);
        } else if (type === "aadharBack") {
          setAadharBackPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
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
        <label className="block text-gray-700 font-medium mb-2">
          Period Of Days
        </label>
        <select
          {...register("period")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-150"
        >
          {["Day", "Month"].map((bed: any) => (
            <option
              key={bed}
              value={bed}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              {bed}
            </option>
          ))}
        </select>
        {errors.period && (
          <span className="text-red-600 mt-1 text-sm">
            {errors.period.message}
          </span>
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
          onChange={(e) => onFileChange(e, "Photo")}
        />
        {errors.photo && (
          <span className="text-red-600">{errors.photo.message}</span>
        )}

        {imagePreview && (
          <div className="mt-4">
            <Image
              src={imagePreview as string}
              alt="Preview"
              width={200}
              height={100}
              className="w-full max-w-xs object-cover border border-gray-300 rounded-lg"
            />
          </div>
        )}
      </div>
      <div>
        <label className="block text-gray-700">Aadhar</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          {...register("aadharFront")}
          placeholder="Aadhar Front"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          onChange={(e) => onFileChange(e, "aadharFront")}
        />
        {errors.aadharFront && (
          <span className="text-red-600">{errors.aadharFront.message}</span>
        )}
        {aadharFrontPreview && (
          <div className="mt-4">
            <Image
              src={aadharFrontPreview as string}
              alt="Preview"
              width={200}
              height={100}
              className="w-full max-w-xs object-cover border border-gray-300 rounded-lg"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-gray-700">Aadhar Back</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          {...register("aadharBack")}
          placeholder="aadharBack"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          onChange={(e) => onFileChange(e, "aadharBack")}
        />
        {errors.aadharBack && (
          <span className="text-red-600">{errors.aadharBack.message}</span>
        )}
        {aadharBackPreview && (
          <div className="mt-4">
            <Image
              src={aadharBackPreview as string}
              alt="Preview"
              width={200}
              height={100}
              className="w-full max-w-xs object-cover border border-gray-300 rounded-lg"
            />
          </div>
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
