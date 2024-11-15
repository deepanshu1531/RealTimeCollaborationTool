import java.io.*;
import java.util.Scanner;

public class Main {

	static void readFiles(String path, String name) {
		try {
			File f1 = new File(path + name);
			if (f1.exists()) {
				if (f1.length() != 0) {
					Scanner sc = new Scanner(f1);
					while (sc.hasNextLine()) {
						String fileData = sc.nextLine();
						System.out.println(fileData);
					}
					sc.close();
				} else {
					System.out.println("File is empty.");
				}
			} else {
				throw new FileNotFoundException();
			}
		} catch (FileNotFoundException exception) {
			System.out.println("Unexcpected error occurred!");
			exception.printStackTrace();
		}
	}

	public static void main(String[] args) {
		readFiles("C:\\Users\\verma\\Documents\\TestFolder\\", "Main.java");
		new Scanner(System.in).next();
	}
}