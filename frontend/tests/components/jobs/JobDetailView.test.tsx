import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JobDetailView } from "@/components/jobs/JobDetailView";
import { sampleJobRequest } from "@/lib/constants";
import { makeJobDetail } from "../../jobFixtures";

describe("JobDetailView", () => {
  it("shows the original request, prompt, status, and image", () => {
    const job = makeJobDetail();
    render(<JobDetailView job={job} loading={false} error={null} />);

    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(screen.getByText(sampleJobRequest.bookTitle)).toBeInTheDocument();
    expect(screen.getByText(sampleJobRequest.sceneText)).toBeInTheDocument();
    expect(document.querySelector("pre")?.textContent).toBe(job.generatedPrompt);
    expect(screen.getByRole("img", { name: /illustration for biscuit's muddy adventure/i })).toHaveAttribute(
      "src",
      job.imageUrl!,
    );
  });

  it("shows the error when a job failed", () => {
    render(
      <JobDetailView
        job={makeJobDetail({
          status: "failed",
          imageUrl: null,
          error: "Mock generator failed on purpose.",
        })}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText("failed")).toBeInTheDocument();
    expect(screen.getByText(/failed on purpose/i)).toBeInTheDocument();
    expect(screen.getByText(/no image was generated/i)).toBeInTheDocument();
  });
});
