import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { UserPlusIcon } from "lucide-react";
import { z } from "zod";

import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";

const registerSchema = z.object({
	email: z.email("Enter a valid email address.").trim(),
	firstName: z.string().trim().min(1, "First name is required."),
	lastName: z.string().trim().min(1, "Last name is required."),
	password: z.string().min(8, "Password must be at least 8 characters."),
});

const registerResponseSchema = z.object({
	id: z.string(),
	email: z.email(),
	firstName: z.string(),
	lastName: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const registerUser = createServerFn({
	method: "POST",
})
	.inputValidator((data: RegisterFormValues) => registerSchema.parse(data))
	.handler(async ({ data }) => {
		const serverUrl = process.env.SERVER_URL;

		if (!serverUrl) {
			throw new Error("SERVER_URL is not configured for signup requests.");
		}

		const response = await fetch(new URL("/auth/register", serverUrl), {
			method: "POST",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
			},
			body: JSON.stringify(data),
		});

		const contentType = response.headers.get("content-type") ?? "";
		const payload = contentType.includes("application/json")
			? await response.json()
			: await response.text();

		if (!response.ok) {
			throw new Error(getApiErrorMessage(payload, response.status));
		}

		return registerResponseSchema.parse(payload);
	});

export const Route = createFileRoute("/signup")({
	component: SignupRoute,
});

function SignupRoute() {
	const mutation = useMutation({
		mutationKey: ["register-user"],
		mutationFn: (value: RegisterFormValues) => registerUser({ data: value }),
		onSuccess: async () => {
			if (typeof window !== "undefined") {
				window.location.assign("/login");
			}
		},
	});

	const form = useForm({
		defaultValues: {
			email: "",
			firstName: "",
			lastName: "",
			password: "",
		} satisfies RegisterFormValues,
		validators: {
			onBlur: registerSchema,
			onSubmit: registerSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
		},
	});

	return (
		<main className="page-wrap px-4 pb-12 pt-14">
			<section className="max-w-lg mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Create your account</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							noValidate
							onSubmit={(event) => {
								event.preventDefault();
								event.stopPropagation();
								void form.handleSubmit();
							}}
						>
							<FieldGroup>
								<form.Field
									name="email"
									children={(field) => {
										const isInvalid =
											(field.state.meta.isTouched ||
												form.state.submissionAttempts > 0) &&
											field.state.meta.errors.length > 0;

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Email</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													type="email"
													autoComplete="email"
													placeholder="user@example.com"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													aria-invalid={isInvalid}
												/>
												<FieldDescription>
													Enter the email address that will be sent to the auth
													registration endpoint.
												</FieldDescription>
												{isInvalid && (
													<FieldError
														errors={toFieldErrors(field.state.meta.errors)}
													/>
												)}
											</Field>
										);
									}}
								/>

								<div className="grid gap-4 sm:grid-cols-2">
									<form.Field
										name="firstName"
										children={(field) => {
											const isInvalid =
												(field.state.meta.isTouched ||
													form.state.submissionAttempts > 0) &&
												field.state.meta.errors.length > 0;

											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name}>
														First name
													</FieldLabel>
													<Input
														id={field.name}
														name={field.name}
														autoComplete="given-name"
														placeholder="Jane"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(event) =>
															field.handleChange(event.target.value)
														}
														aria-invalid={isInvalid}
													/>
													{isInvalid && (
														<FieldError
															errors={toFieldErrors(field.state.meta.errors)}
														/>
													)}
												</Field>
											);
										}}
									/>

									<form.Field
										name="lastName"
										children={(field) => {
											const isInvalid =
												(field.state.meta.isTouched ||
													form.state.submissionAttempts > 0) &&
												field.state.meta.errors.length > 0;

											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name}>
														Last name
													</FieldLabel>
													<Input
														id={field.name}
														name={field.name}
														autoComplete="family-name"
														placeholder="Doe"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(event) =>
															field.handleChange(event.target.value)
														}
														aria-invalid={isInvalid}
													/>
													{isInvalid && (
														<FieldError
															errors={toFieldErrors(field.state.meta.errors)}
														/>
													)}
												</Field>
											);
										}}
									/>
								</div>

								<form.Field
									name="password"
									children={(field) => {
										const isInvalid =
											(field.state.meta.isTouched ||
												form.state.submissionAttempts > 0) &&
											field.state.meta.errors.length > 0;

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Password</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													type="password"
													autoComplete="new-password"
													placeholder="StrongPassword123!"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(event) =>
														field.handleChange(event.target.value)
													}
													aria-invalid={isInvalid}
												/>
												<FieldDescription>
													Match the DTO requirement with at least 8 characters.
												</FieldDescription>
												{isInvalid && (
													<FieldError
														errors={toFieldErrors(field.state.meta.errors)}
													/>
												)}
											</Field>
										);
									}}
								/>

								{mutation.isError && (
									<Field data-invalid>
										<FieldError>
											{getMutationErrorMessage(mutation.error)}
										</FieldError>
									</Field>
								)}
							</FieldGroup>
						</form>
					</CardContent>
					<CardFooter className="flex-col items-stretch gap-4 border-t border-(--line)">
						<form.Subscribe
							selector={(state) => ({
								canSubmit: state.canSubmit,
								isSubmitting: state.isSubmitting,
							})}
						>
							{({ canSubmit, isSubmitting }) => (
								<Button
									type="submit"
									className="w-full"
									disabled={!canSubmit || isSubmitting || mutation.isPending}
									onClick={() => void form.handleSubmit()}
								>
									<UserPlusIcon data-icon="inline-start" />
									{isSubmitting || mutation.isPending
										? "Creating account..."
										: "Create account"}
								</Button>
							)}
						</form.Subscribe>

						<p className="text-center text-xs text-(--sea-ink-soft)">
							Already registered?{" "}
							<a
								href="/login"
								className="font-medium text-(--lagoon-deep) underline underline-offset-4"
							>
								Continue to login
							</a>
							.
						</p>
					</CardFooter>
				</Card>
			</section>
		</main>
	);
}

function toFieldErrors(errors: unknown[]) {
	return errors.flatMap((error) => {
		if (typeof error === "string") {
			return [{ message: error }];
		}

		if (error instanceof Error) {
			return [{ message: error.message }];
		}

		if (
			typeof error === "object" &&
			error !== null &&
			"message" in error &&
			typeof error.message === "string"
		) {
			return [{ message: error.message }];
		}

		return [];
	});
}

function getMutationErrorMessage(error: unknown) {
	if (error instanceof Error && error.message) {
		return error.message;
	}

	return "Unable to create your account right now.";
}

function getApiErrorMessage(payload: unknown, status: number) {
	if (typeof payload === "string" && payload.trim()) {
		return payload;
	}

	if (
		typeof payload === "object" &&
		payload !== null &&
		"message" in payload &&
		typeof payload.message === "string"
	) {
		return payload.message;
	}

	if (
		typeof payload === "object" &&
		payload !== null &&
		"error" in payload &&
		typeof payload.error === "string"
	) {
		return payload.error;
	}

	return `Signup request failed with status ${status}.`;
}
