import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { JobList } from "@/components/jobs/JobList";
import { makeJobListItem } from "../../jobFixtures";

describe("JobList", () => {
  it("shows job id, title, type, status, and created time", () => {
    render(
      <JobList
        jobs={[makeJobListItem({ status: "processing" })]}
        loading={false}
        error={null}
        selectedJobId="job_test1"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("job_test1")).toBeInTheDocument();
    expect(screen.getByText("Biscuit's Muddy Adventure")).toBeInTheDocument();
    expect(screen.getByText("Half page")).toBeInTheDocument();
    expect(screen.getByText("processing")).toBeInTheDocument();
    expect(screen.getByRole("time")).toHaveAttribute("datetime", "2026-08-24T00:58:00.000Z");
  });

  it("notifies when a job is opened", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <JobList
        jobs={[makeJobListItem()]}
        loading={false}
        error={null}
        selectedJobId={null}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: /biscuit's muddy adventure/i }));
    expect(onSelect).toHaveBeenCalledWith("job_test1");
  });
});
