import React, { useState, useEffect } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const Manager = () => {
    const saveNotify = () =>
        toast.success("👍 Password Saved Successfully", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    const deleteNotify = () =>
        toast.warn("🗑️ Password Deleted!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    const editNotify = () =>
        toast.warn("✏️ Please edit the fields", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    const copyNotify = () =>
        toast.success("👌 Copied to clipboard!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    const emptyNotify = () =>
        toast.error("😬 Please fill all the fields!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    const [isToggled, setisToggled] = useState(false);
    const handleToggle = () => {
        setisToggled(!isToggled);
    };

    const [form, setForm] = useState({
        site: "",
        username: "",
        password: "",
    });

    const [passwordArray, setPasswordArray] = useState([]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const getPassword = async () => {
        let req = await fetch("http://localhost:3000/");
        let passwords = await req.json();
        console.log(passwords);
        setPasswordArray(passwords);
    };

    useEffect(() => {
        getPassword();
    }, []);

    const savePassword = async () => {
        if (form.site === "" || form.username === "" || form.password === "") {
            emptyNotify();
        } else {
            const newId = uuidv4();
            const updatedRecord = { ...form, id: newId };

            try {
                // If we have a form.id, it's an edit operation
                if (form.id) {
                    // Delete the old record
                    await fetch("http://localhost:3000/", {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ id: form.id }),
                    });
                }

                // Create the new record
                await fetch("http://localhost:3000/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedRecord),
                });

                // Update state based on whether it's an edit or new entry
                setPasswordArray((prevArray) => {
                    if (form.id) {
                        // For edit operations, filter out old record and add updated one
                        return [
                            ...prevArray.filter((item) => item.id !== form.id),
                            updatedRecord,
                        ];
                    } else {
                        // For new entries, simply append
                        return [...prevArray, updatedRecord];
                    }
                });

                // Reset form
                setForm({
                    site: "",
                    username: "",
                    password: "",
                });

                saveNotify();
            } catch (error) {
                console.error("Error saving record:", error);
            }
        }
    };
    const deletePassword = async (id) => {
        const confirmDelete = confirm("Cofirm Delete?");
        if (confirmDelete) {
            setPasswordArray(passwordArray.filter((item) => item.id !== id));
            let res = await fetch("http://localhost:3000/", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            // localStorage.setItem(
            //     "passwords",
            //     JSON.stringify(passwordArray.filter((item) => item.id !== id))
            // );

            deleteNotify();
        }
    };
    const editPassword = (id) => {
        console.log("Editing", id);
        //? passwordArray contains array of passwords, passwordArray.filter filters out(delete) all the passwords whose id doesnt match,
        // ? we will end up with one password and [0] selects that object from the array and sets the form
        setForm({
            ...passwordArray.filter((item) => item.id === id)[0],
            id: id,
        });
        setPasswordArray(passwordArray.filter((item) => item.id !== id)); //? deletes the password at first then behaves like a normal save password operation
        editNotify();
    };
    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        copyNotify();
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Bounce}
            />
            <div className="absolute min-h-full w-full -z-10 bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#7dd3fc_100%)]">
                <div
                    id="container"
                    className=" px-2 sm:px-16 lg:px-40 2xl:px-80"
                >
                    <h1 className="text-4xl text font-bold text-center">
                        <span className="text-red-700">&lt;</span>Iron
                        <span className="text-red-700">Cloak</span> /
                        <span className="text-red-700">&gt;</span>
                    </h1>
                    <p className="text-red-700 text-lg text-center font-bold m-2">
                        Your very own Password Manager
                    </p>
                    <div
                        className="gap-2 flex flex-col p-4"
                        onKeyUp={(e) => {
                            if (e.key === "Enter") {
                                savePassword();
                            }
                        }}
                    >
                        <input
                            value={form.site}
                            onChange={handleChange}
                            placeholder="Enter website URL"
                            className="focus:border-green-600 outline-none rounded-full px-4 py-1 w-full border-solid border-2 border-sky-500"
                            type="text"
                            name="site"
                            id="site"
                        />
                        <div className="flex flex-col md:flex-row justify-center gap-5 py-5 ">
                            <input
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Enter Username"
                                className="focus:border-green-600 outline-none rounded-full px-4 py-1 w-full border-solid border-2 border-sky-500"
                                type="text"
                                name="username"
                                id="username"
                                autoComplete="off"
                            />
                            <div className="relative">
                                <input
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter Password "
                                    className="focus:border-green-600 outline-none rounded-full px-4 py-1 w-full border-solid border-2 border-sky-500 "
                                    type={isToggled ? "text" : "password"}
                                    name="password"
                                    id="password"
                                />
                                <span className="absolute right-[3px] top-[6px]">
                                    <img
                                        onClick={handleToggle}
                                        width={30}
                                        src={
                                            isToggled
                                                ? "/icons/show.png"
                                                : "/icons/hide.png"
                                        }
                                        alt="show"
                                        className="cursor-pointer "
                                    />
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={savePassword}
                            className=" bg-sky-400 rounded-full mx-auto px-6 hover:bg-sky-300 active:scale-95 w-fit my-3 py-1.5 flex justify-center items-center gap-2 border-solid border-2 border-green-900 "
                        >
                            <lord-icon
                                src="https://cdn.lordicon.com/jgnvfzqg.json"
                                trigger="hover"
                            ></lord-icon>
                            Save
                        </button>
                    </div>
                    <div className="passwords ">
                        <h2 className="py-4 text-xl font-bold">
                            Your Passwords:
                        </h2>
                        {passwordArray.length === 0 ? (
                            <div>No passwords</div>
                        ) : (
                            <div className="bg w-auto overflow-auto bg-red-50">
                                <table className="table-auto w-full rounded-md overflow-hidden">
                                    <thead className="bg-sky-800 text-yellow-50">
                                        <tr>
                                            <th className="p-3">Website URL</th>
                                            <th className="p-3">Username</th>
                                            <th className="p-3">Password</th>
                                            <th className="p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-center bg-sky-50 ">
                                        {passwordArray.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td className="p-3 border border-white">
                                                        <div className="flex gap-2 justify-center">
                                                            <a
                                                                href={item.site}
                                                                target="_blank"
                                                            >
                                                                {item.site}
                                                            </a>
                                                            <div
                                                                className="copy relative top-1 cursor-pointer"
                                                                onClick={() => {
                                                                    copyText(
                                                                        item.site
                                                                    );
                                                                }}
                                                            >
                                                                <lord-icon
                                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                                    trigger="hover"
                                                                    style={{
                                                                        width: "25px",
                                                                        height: "25px",
                                                                    }}
                                                                ></lord-icon>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border border-white">
                                                        <div className=" flex gap-2 justify-center">
                                                            {item.username}
                                                            <div
                                                                className="copy relative top-1 cursor-pointer"
                                                                onClick={() => {
                                                                    copyText(
                                                                        item.username
                                                                    );
                                                                }}
                                                            >
                                                                <lord-icon
                                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                                    trigger="hover"
                                                                    style={{
                                                                        width: "25px",
                                                                        height: "25px",
                                                                    }}
                                                                ></lord-icon>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border border-white">
                                                        <div className=" flex gap-2 justify-center">
                                                            {item.password}
                                                            <div
                                                                className="copy relative top-1 cursor-pointer"
                                                                onClick={() => {
                                                                    copyText(
                                                                        item.password
                                                                    );
                                                                }}
                                                            >
                                                                <lord-icon
                                                                    src="https://cdn.lordicon.com/iykgtsbt.json"
                                                                    trigger="hover"
                                                                    style={{
                                                                        width: "25px",
                                                                        height: "25px",
                                                                    }}
                                                                ></lord-icon>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border border-white">
                                                        <span
                                                            className="edit cursor-pointer mx-3"
                                                            onClick={() => {
                                                                editPassword(
                                                                    item.id
                                                                );
                                                            }}
                                                        >
                                                            <lord-icon
                                                                src="https://cdn.lordicon.com/gwlusjdu.json"
                                                                trigger="hover"
                                                                style={{
                                                                    width: "25px",
                                                                    height: "25px",
                                                                }}
                                                            ></lord-icon>
                                                        </span>
                                                        <span
                                                            className="delete cursor-pointer"
                                                            onClick={() => {
                                                                deletePassword(
                                                                    item.id
                                                                );
                                                            }}
                                                        >
                                                            <lord-icon
                                                                src="https://cdn.lordicon.com/skkahier.json"
                                                                trigger="hover"
                                                                style={{
                                                                    width: "25px",
                                                                    height: "25px",
                                                                }}
                                                            ></lord-icon>
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Manager;
