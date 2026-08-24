import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateJobForm } from "@/components/jobs/CreateJobForm";
import { sampleJobRequest } from "@/lib/constants";

describe("CreateJobForm", () => {
  it("renders the required brief fields and an optional character field", () => {
    render(<CreateJobForm creating={false} onCreate={vi.fn()} />);

    expect(screen.getByLabelText(/book title/i)).toBeRequired();
    expect(screen.getByLabelText(/age group/i)).toBeRequired();
    expect(screen.getByLabelText(/scene text/i)).toBeRequired();
    expect(screen.getByLabelText(/illustration type/i)).toBeRequired();
    expect(screen.getByLabelText(/spread layout/i)).toBeRequired();
    expect(screen.getByLabelText(/art style/i)).toBeRequired();
    expect(screen.getByLabelText(/character description/i)).not.toBeRequired();
  });

  it("shows validation errors when the required fields are empty", async () => {
    const user = userEvent.setup();
    render(<CreateJobForm creating={false} onCreate={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /queue illustration/i }));

    expect(await screen.findByText(/book title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/scene text is required/i)).toBeInTheDocument();
    expect(screen.getByText(/fix the highlighted fields/i)).toBeInTheDocument();
  });

  it("fills the sample brief and queues it", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateJobForm creating={false} onCreate={onCreate} />);

    await user.click(screen.getByRole("button", { name: /load sample/i }));
    await user.click(screen.getByRole("button", { name: /queue illustration/i }));

    expect(onCreate).toHaveBeenCalledWith({
      ...sampleJobRequest,
      characterDescription: sampleJobRequest.characterDescription,
    });
    expect(await screen.findByText(/job queued/i)).toBeInTheDocument();
  });
});
