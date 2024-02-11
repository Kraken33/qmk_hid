#include <_types/_uint8_t.h>
#include <nlohmann/json.hpp>
#include "hidapi.h"
#include <chrono>
#include <fstream>
#include <iostream>
#include <istream>
#include <ostream>
#include <string.h>
#include <string>
#include <thread>

#define DEVICE_C "/Users/vanluv/develop/keybrd/qmk_hid/device.json"

char manufacturer_string[] = "foostan";
char product_string[] = "Corne";

using namespace std;
using namespace std::this_thread; // sleep_for, sleep_until
using namespace std::chrono;      // nanoseconds, system_clock, seconds
using namespace nlohmann;

uint8_t compare_wchar_char(wchar_t *str1, char *str2) {
    uint8_t i = 0;
    while (str1[i] != 00) {
        if ((char)str1[i] != str2[i]) {
            return 0;
        }
        i++;
    }
    
    return 1;
}

uint8_t find_keyboard_device(hid_device_info *device) {
    while (device) {
        if (compare_wchar_char(device->manufacturer_string, manufacturer_string) &&
            compare_wchar_char(device->product_string, product_string) && device->interface_number == 1) {
            return 1;
        }
        device = device->next;
    }
    
    return 0;
}

void write_metadata(json data) {
    ofstream json_config;
    json_config.open(DEVICE_C);
    if (json_config.is_open())
        json_config << data << endl;
    
    json_config.close();
}

json read_metadata() {
    std::ifstream json_config(DEVICE_C);
    json data = json::parse(json_config);
    json_config.close();
    
    return data;
}

char* wchar_char(wchar_t *str1) {
    char *char_result;
    uint8_t i = 0;
    while (str1[i] != 00) {
        char_result[i] = (char)str1[i];
        i++;
    }
    
    char_result[i] = '\0';
    
    return char_result;
}

int main(void) {
    json data = read_metadata();
    
    struct hid_device_info *devs;
    
    hid_init();
    
    unsigned short vendor_id = static_cast<unsigned short>(data["vendor_id"]);
    unsigned short product_id = static_cast<unsigned short>(data["product_id"]);

    if (vendor_id == 0) {
        devs = hid_enumerate(0x0, 0x0);
        while (!find_keyboard_device(devs)) {
            sleep_for(seconds(5));
            devs = hid_enumerate(0x0, 0x0);
        }

        data["vendor_id"] = devs->vendor_id;
        data["product_id"] = devs->product_id;
        data["manufacturer_string"] = wchar_char(devs->manufacturer_string);
        data["product_string"] =  wchar_char(devs->product_string);
        data["path"] = devs->path;
    } else {
        uint8_t keyboard_had_been_finded = 0;
        do {
            devs = hid_enumerate(vendor_id, product_id);
            keyboard_had_been_finded = find_keyboard_device(devs);
            if(!keyboard_had_been_finded)
                sleep_for(seconds(5));
        } while (!keyboard_had_been_finded);
        data["path"] = devs->path;
    }
    
    hid_free_enumeration(devs);
    write_metadata(data);
    
    system("cd /Users/vanluv/develop/keybrd/qmk_hid && npm run tsc");
}
