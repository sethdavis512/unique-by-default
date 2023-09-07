import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { marked } from "marked";

import { createEntry } from "~/models/entry.server";
import { requireUserId } from "~/session.server";
import format from "date-fns/format";
import { getAllMoods } from "~/models/mood.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");
  const moodArr = (formData.getAll("mood") as string[]).map((m: string) => ({ id: m }));

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Title is required", body: null } },
      { status: 400 }
    );
  }

  if (typeof body !== "string" || body.length === 0) {
    return json(
      { errors: { title: null, body: "Body is required" } },
      { status: 400 }
    );
  }

  const entry = await createEntry({ title, body, userId, moodArr });

  return redirect(`/journal/${entry.id}`);
}

export const loader: LoaderFunction = async ({ request }) => {
  const moods = await getAllMoods();

  return json({
    moods,
  });
};

export default function NewEntryPage() {
  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  const { moods } = useLoaderData();

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  const [entryBody, setEntryBody] = React.useState("");
  const [previewMode, togglePreviewMode] = React.useReducer((s) => !s, false);

  const checkboxWrapperClassName = "border border-zinc-300 mb-2 rounded-lg";
  const checkboxLabelClassName = "block px-3 py-2 select-none";

  return (
    <Form className="flex flex-col gap-6" method="post">
      <div className="max-w-3xl">
        <h2 className="mb-4 flex-auto text-3xl font-semibold text-zinc-900">
          New entry
        </h2>
        <label className="flex w-full flex-col gap-1">
          <h3 className="mb-4 flex-auto text-xl font-semibold text-zinc-900">
            Title
          </h3>
          <input
            ref={titleRef}
            name="title"
            className="mb-4 flex-1 rounded-md border-2 border-green-600 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
            defaultValue={format(new Date(), "MMMM dd, yyyy // p")}
          />
        </label>

        <h3 className="mb-4 flex-auto text-xl font-semibold text-zinc-900">
          Prompts
        </h3>
        <div className="mb-8">
          <ul className="list-disc pl-4">
            <li className="mb-4">
              <p>
                Describe your day using as many sensory details as possible. The
                goal is to practice being fully present in whatever state you're
                in.
              </p>
            </li>
            <li className="mb-4">
              <p>
                Write about a time when you felt completely understood and
                accepted.
              </p>
            </li>
            <li className="mb-4">
              <p>Did you dwell on past pain or feelings of rejection?</p>
            </li>
            <li className="mb-4">
              <p>
                Rest from the search of proving to yourself that you are
                extraordinary. You have intrinsic worth. Give your imagination
                rest from fantasy and enjoy the present. How can you embrace the
                present even if it's less than you hoped?
              </p>
            </li>
            <li className="mb-4">
              <p>
                In what ways did you compare yourself to others today? Did you
                find yourself to be better than or less than others? Notice
                whether you found yourself envying others, or feeling superior —
                both are a symptom of your inner tendency to constantly compare.
              </p>
            </li>
          </ul>
          <p className="mb-4">Which of these emotions did you feel today?</p>
          <fieldset>
            {moods.map((mood: { id: string; name: string }) => (
              <div className={checkboxWrapperClassName} key={mood.id}>
                <label
                  className={checkboxLabelClassName}
                  htmlFor={`${mood.name}Checkbox`}
                >
                  <input
                    id={`${mood.name}Checkbox`}
                    className="mr-2"
                    type="checkbox"
                    name="mood"
                    value={mood.id}
                  />
                  {mood.name}
                </label>
              </div>
            ))}
          </fieldset>
        </div>
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}

        <div>
          {previewMode ? (
            <div className="rounded-lg border p-4">
              <span className="mb-4 inline-block rounded-full bg-gray-600 px-4 py-2 text-white">
                Preview
              </span>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: marked.parse(entryBody) }}
              ></div>
            </div>
          ) : (
            <label className="mb-6 flex w-full flex-col gap-1">
              <span>Entry: </span>
              <textarea
                ref={bodyRef}
                name="body"
                rows={8}
                className="w-full flex-1 rounded-md border-2 border-green-600 py-2 px-3 text-lg leading-6"
                aria-invalid={actionData?.errors?.body ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.body ? "body-error" : undefined
                }
                onChange={({ target }) => setEntryBody(target.value)}
                value={entryBody}
              />
            </label>
          )}
          {actionData?.errors?.body && (
            <div className="pt-1 text-red-700" id="body-error">
              {actionData.errors.body}
            </div>
          )}
        </div>

        <div className="text-right">
          {entryBody && (
            <button
              type="button"
              onClick={togglePreviewMode}
              className="hover:bg-white-600 focus:bg-white-400 mr-4 rounded border border-green-600 bg-white py-2 px-4 text-green-600"
            >
              {previewMode ? "Edit" : "Preview"}
            </button>
          )}
          <button
            type="submit"
            className="rounded bg-green-600 py-2 px-4 text-white hover:bg-green-600 focus:bg-green-400"
          >
            Save
          </button>
        </div>
      </div>
    </Form>
  );
}
