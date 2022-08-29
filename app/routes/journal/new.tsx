import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import { marked } from "marked";

import { createEntry } from "~/models/entry.server";
import { requireUserId } from "~/session.server";
import format from "date-fns/format";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

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

  const entry = await createEntry({ title, body, userId });

  return redirect(`/journal/${entry.id}`);
}

export default function NewEntryPage() {
  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  const [entryBody, setEntryBody] = React.useState("");
  const [previewMode, togglePreviewMode] = React.useReducer((s) => !s, false);

  return (
    <Form className="flex flex-col gap-6" method="post">
      <div className="max-w-4xl">
        <h2 className="mb-4 flex-auto text-3xl font-semibold text-zinc-900">
          New entry
        </h2>
        <h3 className="mb-4 flex-auto text-xl font-semibold text-zinc-900">
          Prompts
        </h3>
        <div className="mb-8">
          <ul className="list-disc pl-4">
            <li className="mb-4">
              <p>
                What are your good qualities? How do you plan or did you use
                them today?
                <br />
                Name and own those qualities as they will help you through times
                of envy.
              </p>
            </li>
            <li className="mb-4">
              <p>
                How can you share those positive qualities with others? If you
                did share, what was the effect it had on people?
              </p>
            </li>
            <li className="mb-4">
              <p>
                Did you dwell on past pain or feelings of rejection? When you go
                to manufacture that story, know that it is not true of who you
                are now.
              </p>
            </li>
          </ul>
        </div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            className="flex-1 rounded-md border-2 border-green-600 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
            defaultValue={format(new Date(), "MMMM dd, yyyy // p")}
          />
        </label>
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
