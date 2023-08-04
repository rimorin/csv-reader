import Home from "./page";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// mock Invoice Table component
jest.mock("./components/table", () => {
  return {
    __esModule: true,
    default: () => {
      return <div data-testid="dummyInvTable">Dummy Invoice Table</div>;
    },
  };
});

// mock upload-js library
jest.mock("upload-js", () => {
  return {
    __esModule: true,
    Upload: () => {
      return {
        uploadFile: () => {
          return {
            fileUrl: "https://upload.io/dummy_uploaded_csv_file.csv",
          };
        },
      };
    },
  };
});

describe("Home", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
    };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  beforeAll(() => {
    window.alert = jest.fn();
  });

  it("render home", () => {
    render(<Home />);
    expect(screen.getByText("CSV Reader")).toBeInTheDocument();
  });

  it("render home without upload API key", () => {
    process.env = {
      ...OLD_ENV,
      NEXT_PUBLIC_UPLOAD_IO_API_KEY: "",
    };
    render(<Home />);
    expect(
      screen.getByText(
        "Please set your Upload.IO API key into your environment"
      )
    ).toBeInTheDocument();
  });

  it("upload invalid file", () => {
    render(<Home />);
    const file = new File(["(⌐□_□)"], "cognizant.png", {
      type: "image/png",
    });
    const input = screen.getByTestId("fileUpload");
    fireEvent.change(input, { target: { files: [file] } });
    // expect window alert to be called
    expect(window.alert).toBeCalledWith("Please upload a CSV file!");
  });

  it("upload valid csv file", async () => {
    render(<Home />);
    const file = new File(["(⌐□_□)"], "cognizant.csv", {
      type: "text/csv",
    });
    const input = screen.getByTestId("fileUpload");
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(window.alert).toBeCalledWith(
        "File uploaded!\nProceeding to parse the file..."
      )
    );
  });
});
