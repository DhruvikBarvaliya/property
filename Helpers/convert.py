# Python3 program to convert docx to pdf
# using docx2pdf module

# Import the convert method from the
# docx2pdf module
from docx2pdf import convert

# convert(r"C:\Users\EV\Desktop\Property\modified.docx", r"C:\Users\EV\Desktop\Property\output.pdf")


def convert_docx_to_pdf(input_file, output_file):
    convert(input_file, output_file)


if __name__ == "__main__":
    import sys

    arg1 = sys.argv[1]
    arg2 = sys.argv[2]
    result = convert_docx_to_pdf(arg1, arg2)
